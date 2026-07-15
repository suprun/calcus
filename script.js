/**
 * Town Planning Cost Calculator
 * Re-designed with range sliders, numeric steppers repeat logic, duplicate bottom results and PDF printing.
 */

// --- DATABASES OF TARIFFS AND CONSTANTS ---

const TARIFFS = {
    stateParts: [
        { min: 10.0, max: 20.0, a: 69924.25, b: 827.4 },
        { min: 20.001, max: 50.0, a: 77035.84, b: 471.82 }
    ],
    regionalRegion: [
        { min: 10.0, max: 20.0, a: 81532.0, b: 965.0 },
        { min: 20.001, max: 50.0, a: 89824.0, b: 550.0 }
    ],
    regionalDistrict: [
        { min: 0.5, max: 1.0, a: 15619.0, b: 2527.0 },
        { min: 1.001, max: 5.0, a: 17245.0, b: 901.0 },
        { min: 5.001, max: 10.0, a: 19934.0, b: 362.6 },
        { min: 10.001, max: 20.0, a: 22963.0, b: 59.5 }
    ],
    localComplexArea: [
        { min: 0.0, max: 0.5, a: 29386.0, b: 49861.0 },
        { min: 0.501, max: 1.0, a: 32800.0, b: 5306.0 },
        { min: 1.001, max: 5.0, a: 36215.0, b: 1891.0 }
    ],
    localGeneralPlan: [
        { min: 0.2, max: 0.5, a: 1304.3, b: 4233.0 },
        { min: 0.501, max: 1.0, a: 1673.0, b: 3513.4 },
        { min: 1.001, max: 2.0, a: 2928.7, b: 2259.5 },
        { min: 2.001, max: 5.0, a: 5821.5, b: 669.0 },
        { min: 5.001, max: 10.0, a: 6490.7, b: 536.0 },
        { min: 10.001, max: 25.0, a: 6780.3, b: 507.3 },
        { min: 25.001, max: 49.9, a: 13377.0, b: 243.0 },
        { min: 50.001, max: 100.0, a: 21332.0, b: 213.5 },
        { min: 100.001, max: 250.0, a: 24533.0, b: 181.5 },
        { min: 250.001, max: 499.9, a: 41229.0, b: 116.3 },
        { min: 500.001, max: 750.0, a: 43048.0, b: 85.5 },
        { min: 750.001, max: 1000.0, a: 43900.0, b: 84.4 },
        { min: 1000.001, max: 1500.0, a: 70543.0, b: 57.7 },
        { min: 1500.001, max: 2500.0, a: 88835.4, b: 45.53 }
    ],
    localDetailedArea: [
        { min: 20.0, max: 30.0, a: 1823.4, b: 178.4 },
        { min: 30.1, max: 50.0, a: 2276.0, b: 169.0 },
        { min: 50.1, max: 100.0, a: 6243.0, b: 89.2 },
        { min: 100.1, max: 250.0, a: 10033.5, b: 51.2 },
        { min: 250.1, max: 500.0, a: 11731.4, b: 44.4 },
        { min: 500.1, max: 1000.0, a: 19395.7, b: 29.3 }
    ],
    localComplexLandPop: [
        { min: 0.0, max: 3.0, a: 720.0, b: 2350.0 },
        { min: 3.001, max: 7.0, a: 930.0, b: 1950.0 },
        { min: 7.001, max: 10.0, a: 1620.0, b: 1250.0 },
        { min: 10.001, max: 15.0, a: 3560.0, b: 290.0 },
        { min: 15.001, max: 25.0, a: 3600.0, b: 280.0 },
        { min: 25.001, max: 50.0, a: 3770.0, b: 270.0 },
        { min: 50.001, max: 100.0, a: 7440.0, b: 135.0 },
        { min: 100.001, max: 250.0, a: 11860.0, b: 118.7 },
        { min: 250.001, max: 500.0, a: 13640.0, b: 100.9 },
        { min: 500.001, max: 800.0, a: 22920.0, b: 64.6 },
        { min: 800.001, max: 1500.0, a: 23930.0, b: 47.5 },
        { min: 1500.001, max: 9999.9, a: 24400.0, b: 46.9 }
    ],
    localComplexLandArea: [
        { min: 25.0, max: 150.0, a: 15619.0, b: 2527.0 },
        { min: 150.001, max: 400.0, a: 16271.0, b: 667.5 },
        { min: 400.001, max: 800.0, a: 17401.0, b: 269.5 },
        { min: 800.001, max: 1300.0, a: 18965.0, b: 140.6 },
        { min: 1300.001, max: 1900.0, a: 20877.0, b: 86.2 },
        { min: 1900.001, max: 2500.0, a: 22963.0, b: 59.5 }
    ],
    localDetailedLandArea: [
        { min: 20.0, max: 30.0, a: 1300.0, b: 140.0 },
        { min: 30.1, max: 50.0, a: 1650.0, b: 125.0 },
        { min: 50.1, max: 100.0, a: 4000.0, b: 70.0 },
        { min: 100.1, max: 250.0, a: 6500.0, b: 45.0 },
        { min: 250.1, max: 500.0, a: 8200.0, b: 36.0 },
        { min: 500.1, max: 1000.0, a: 12000.0, b: 28.0 }
    ]
};

// --- SLIDER VALUE MAPS ---

const SLIDER_MAPS = {
    sp_f_pop: [
        { label: "до 0.5 млн. осіб (К = 0.95)", val: 0.95 },
        { label: "0.501 - 1.0 млн. осіб (К = 1.0)", val: 1.0 },
        { label: "1.001 - 2.0 млн. осіб (К = 1.05)", val: 1.05 },
        { label: "2.001 - 3.0 млн. осіб (К = 1.1)", val: 1.1 },
        { label: "понад 3.0 млн. осіб (К = 1.2)", val: 1.2 }
    ],
    sp_f_urban: [
        { label: "до 20 пунктів (К = 1.0)", val: 1.0 },
        { label: "21 - 50 пунктів (К = 1.05)", val: 1.05 },
        { label: "51 - 100 пунктів (К = 1.1)", val: 1.1 },
        { label: "понад 100 пунктів (К = 1.15)", val: 1.15 }
    ],
    sp_f_rural: [
        { label: "до 1000 пунктів (К = 1.0)", val: 1.0 },
        { label: "1001 - 2000 пунктів (К = 1.05)", val: 1.05 },
        { label: "2001 - 4000 пунктів (К = 1.1)", val: 1.1 },
        { label: "понад 4000 пунктів (К = 1.15)", val: 1.15 }
    ],
    sp_f_cities100: [
        { label: "немає (К = 1.0)", val: 1.0 },
        { label: "1 місто (К = 1.05)", val: 1.05 },
        { label: "2 міста (К = 1.1)", val: 1.1 },
        { label: "3 міста (К = 1.15)", val: 1.15 },
        { label: "більше 3 міст (К = 1.2)", val: 1.2 }
    ],
    rr_f_pop: [
        { label: "до 0.5 млн. осіб (К = 0.95)", val: 0.95 },
        { label: "0.501 - 1.0 млн. осіб (К = 1.0)", val: 1.0 },
        { label: "1.001 - 2.0 млн. осіб (К = 1.05)", val: 1.05 },
        { label: "2.001 - 3.0 млн. осіб (К = 1.1)", val: 1.1 },
        { label: "понад 3.0 млн. осіб (К = 1.2)", val: 1.2 }
    ],
    rr_f_urban: [
        { label: "до 20 пунктів (К = 1.0)", val: 1.0 },
        { label: "21 - 50 пунктів (К = 1.05)", val: 1.05 },
        { label: "51 - 100 пунктів (К = 1.1)", val: 1.1 },
        { label: "понад 100 пунктів (К = 1.15)", val: 1.15 }
    ],
    rr_f_rural: [
        { label: "до 1000 пунктів (К = 1.0)", val: 1.0 },
        { label: "1001 - 1500 пунктів (К = 1.1)", val: 1.1 },
        { label: "понад 1500 пунктів (К = 1.15)", val: 1.15 }
    ],
    rr_f_cities100: [
        { label: "немає (К = 1.0)", val: 1.0 },
        { label: "1 місто (К = 1.05)", val: 1.05 },
        { label: "2 міста (К = 1.1)", val: 1.1 },
        { label: "3 міста (К = 1.15)", val: 1.15 },
        { label: "більше 3 міст (К = 1.2)", val: 1.2 }
    ],
    rr_f_ind: [
        { label: "до 1 галузі (К = 1.0)", val: 1.0 },
        { label: "2 галузі (К = 1.1)", val: 1.1 },
        { label: "3 галузі (К = 1.2)", val: 1.2 },
        { label: "більше 3 галузей (К = 1.3)", val: 1.3 }
    ],
    rr_f_forest: [
        { label: "до 100 тис. га (К = 1.0)", val: 1.0 },
        { label: "100.1 - 200 тис. га (К = 1.05)", val: 1.05 },
        { label: "понад 200.1 тис. га (К = 1.1)", val: 1.1 }
    ],
    rd_f_pop: [
        { label: "до 40 тис. осіб (К = 1.0)", val: 1.0 },
        { label: "40.1 - 70 тис. осіб (К = 1.05)", val: 1.05 },
        { label: "70.1 - 110 тис. осіб (К = 1.1)", val: 1.1 },
        { label: "110.1 - 150 тис. осіб (К = 1.15)", val: 1.15 },
        { label: "понад 150 тис. осіб (К = 1.2)", val: 1.2 }
    ],
    rd_f_urban: [
        { label: "1 пункт (К = 1.0)", val: 1.0 },
        { label: "2 пункти (К = 1.5)", val: 1.5 },
        { label: "3 пункти (К = 1.1)", val: 1.1 },
        { label: "більше 3 пунктів (К = 1.2)", val: 1.2 }
    ],
    rd_f_rural: [
        { label: "до 100 пунктів (К = 1.0)", val: 1.0 },
        { label: "101 - 150 пунктів (К = 1.05)", val: 1.05 },
        { label: "151 - 200 пунктів (К = 1.1)", val: 1.1 },
        { label: "201 - 270 пунктів (К = 1.15)", val: 1.15 },
        { label: "271 - 350 пунктів (К = 1.2)", val: 1.2 },
        { label: "понад 351 пунктів (К = 1.25)", val: 1.25 }
    ],
    rd_f_ind: [
        { label: "до 1 галузі (К = 1.0)", val: 1.0 },
        { label: "2 галузі (К = 1.1)", val: 1.1 },
        { label: "3 галузі (К = 1.2)", val: 1.2 },
        { label: "більше 3 галузей (К = 1.3)", val: 1.3 }
    ],
    rd_f_forest: [
        { label: "до 20 тис. га (К = 0.95)", val: 0.95 },
        { label: "20.1 - 40.0 тис. га (К = 1.0)", val: 1.0 },
        { label: "40.1 - 80.0 тис. га (К = 1.05)", val: 1.05 },
        { label: "80.1 - 130.0 тис. га (К = 1.1)", val: 1.1 },
        { label: "понад 130.1 тис. га (К = 1.15)", val: 1.15 }
    ],
    cp_f_pop: [
        { label: "до 10 тис. осіб (К = 1.0)", val: 1.0 },
        { label: "10.1 - 30 тис. осіб (К = 1.05)", val: 1.05 },
        { label: "30.1 - 60 тис. осіб (К = 1.1)", val: 1.1 },
        { label: "60.1 - 120 тис. осіб (К = 1.15)", val: 1.15 },
        { label: "понад 120 тис. осіб (К = 1.2)", val: 1.2 }
    ],
    cp_f_urban: [
        { label: "немає (К = 0.9)", val: 0.9 },
        { label: "1 пункт (К = 1.0)", val: 1.0 },
        { label: "2 пункти (К = 1.05)", val: 1.05 },
        { label: "3 пункти (К = 1.1)", val: 1.1 },
        { label: "більше 3 пунктів (К = 1.2)", val: 1.2 }
    ],
    cp_f_rural: [
        { label: "до 10 пунктів (К = 1.0)", val: 1.0 },
        { label: "11 - 20 пунктів (К = 1.05)", val: 1.05 },
        { label: "21 - 50 пунктів (К = 1.1)", val: 1.1 },
        { label: "понад 50 пунктів (К = 1.15)", val: 1.15 }
    ],
    cp_f_ind: [
        { label: "до 1 галузі (К = 1.0)", val: 1.0 },
        { label: "2 галузі (К = 1.1)", val: 1.1 },
        { label: "3 галузі (К = 1.2)", val: 1.2 },
        { label: "більше 3 галузей (К = 1.3)", val: 1.3 }
    ],
    cp_f_users: [
        { label: "до 5 000 (К = 1.0)", val: 1.0 },
        { label: "від 5 000 до 20 000 (К = 1.1)", val: 1.1 },
        { label: "від 20 000 до 50 000 (К = 1.15)", val: 1.15 },
        { label: "від 50 000 до 100 000 (К = 1.2)", val: 1.2 },
        { label: "понад 100 000 (К = 1.25)", val: 1.25 },
        { label: "для мм. Києва та Севастополя (К = 1.5)", val: 1.5 }
    ],
    gp_city_k: [
        { label: "Звичайне місто/село (К = 1.0)", val: 1.0 },
        { label: "Місто-мільйонник (К = 1.1)", val: 1.1 },
        { label: "м. Київ та приміська зона (К = 1.2)", val: 1.2 }
    ],
    dp_scale_k: [
        { label: "1:2000 (К = 1.0)", val: 1.0 },
        { label: "1:1000 (К = 1.25)", val: 1.25 },
        { label: "1:500 (К = 1.5)", val: 1.5 }
    ],
    dp_type_k: [
        { label: "Звичайна територія (К = 1.0)", val: 1.0 },
        { label: "Спеціальна (К = 1.1)", val: 1.1 }
    ],

    // Military actions complicating factor
    sp_f_mil: [
        { label: "Військові дії: немає (К = 1.0)", val: 1.0 },
        { label: "Військові дії: пошкодження до 50% площі (К = 1.1)", val: 1.1 },
        { label: "Військові дії: пошкодження 50-100% площі (К = 1.15)", val: 1.15 }
    ],
    rr_f_mil: [
        { label: "Військові дії: немає (К = 1.0)", val: 1.0 },
        { label: "Військові дії: пошкодження до 50% площі (К = 1.1)", val: 1.1 },
        { label: "Військові дії: пошкодження 50-100% площі (К = 1.15)", val: 1.15 }
    ],
    rd_f_mil: [
        { label: "Військові дії: немає (К = 1.0)", val: 1.0 },
        { label: "Військові дії: пошкодження до 50% площі (К = 1.1)", val: 1.1 },
        { label: "Військові дії: пошкодження 50-100% площі (К = 1.15)", val: 1.15 }
    ],
    cp_f_mil: [
        { label: "Військові дії: немає (К = 1.0)", val: 1.0 },
        { label: "Військові дії: пошкодження до 50% площі (К = 1.1)", val: 1.1 },
        { label: "Військові дії: пошкодження 50-100% площі (К = 1.15)", val: 1.15 }
    ],
    gp_f_mil: [
        { label: "Військові дії: немає (К = 1.0)", val: 1.0 },
        { label: "Військові дії: пошкодження до 50% площі (К = 1.1)", val: 1.1 },
        { label: "Військові дії: пошкодження 50-100% площі (К = 1.15)", val: 1.15 }
    ],
    dp_f_mil: [
        { label: "Військові дії: немає (К = 1.0)", val: 1.0 },
        { label: "Військові дії: пошкодження до 50% площі (К = 1.1)", val: 1.1 },
        { label: "Військові дії: пошкодження 50-100% площі (К = 1.15)", val: 1.15 }
    ],

    // Resort status complicating factor
    sp_f_resort: [
        { label: "Курорт: немає (К = 1.0)", val: 1.0 },
        { label: "Курорт: місцевого значення (К = 1.1)", val: 1.1 },
        { label: "Курорт: державного значення (К = 1.2)", val: 1.2 }
    ],
    rr_f_resort: [
        { label: "Курорт: немає (К = 1.0)", val: 1.0 },
        { label: "Курорт: місцевого значення (К = 1.1)", val: 1.1 },
        { label: "Курорт: державного значення (К = 1.2)", val: 1.2 }
    ],
    rd_f_resort: [
        { label: "Курорт: немає (К = 1.0)", val: 1.0 },
        { label: "Курорт: місцевого значення (К = 1.1)", val: 1.1 },
        { label: "Курорт: державного значення (К = 1.2)", val: 1.2 }
    ],
    cp_f_resort: [
        { label: "Курорт: немає (К = 1.0)", val: 1.0 },
        { label: "Курорт: місцевого значення (К = 1.1)", val: 1.1 },
        { label: "Курорт: державного значення (К = 1.2)", val: 1.2 }
    ],
    gp_f_resort: [
        { label: "Курорт: немає (К = 1.0)", val: 1.0 },
        { label: "Курорт: місцевого значення (К = 1.1)", val: 1.1 },
        { label: "Курорт: державного значення (К = 1.2)", val: 1.2 }
    ],
    dp_f_resort: [
        { label: "Курорт: немає (К = 1.0)", val: 1.0 },
        { label: "Курорт: місцевого значення (К = 1.1)", val: 1.1 },
        { label: "Курорт: державного значення (К = 1.2)", val: 1.2 }
    ],

    // Detailed land data format complicating factor
    dp_f_data: [
        { label: "Вихідні дані: у цифрі .xml (К = 1.0)", val: 1.0 },
        { label: "Вихідні дані: у цифрі не .xml (К = 1.1)", val: 1.1 },
        { label: "Вихідні дані: тільки в паперовому вигляді (К = 1.1)", val: 1.1 }
    ],

    // Land plots forming
    dp_f_plots: [
        { label: "Нові ділянки: не формуються (К = 1.0)", val: 1.0 },
        { label: "Нові ділянки: формування до 10 ділянок (К = 1.2)", val: 1.2 },
        { label: "Нові ділянки: формування понад 10 ділянок (К = 1.5)", val: 1.5 }
    ],

    // Functional zones count
    dp_f_zones: [
        { label: "Функціональні зони: до 100 (К = 1.0)", val: 1.0 },
        { label: "Функціональні зони: від 101 до 500 (К = 1.1)", val: 1.1 },
        { label: "Функціональні зони: від 501 до 1000 (К = 1.2)", val: 1.2 },
        { label: "Функціональні зони: понад 1000 (К = 1.3)", val: 1.3 }
    ]
};

// --- CORE CALCULATION LOGIC ---

function calculateBasePrice(p, intervals, paramName = "Показник", unit = "") {
    if (p <= 0 || isNaN(p)) {
        return { basePrice: 0, note: "Невірне значення параметра", warning: false };
    }

    const first = intervals[0];
    const last = intervals[intervals.length - 1];

    let warning = false;
    let warningMsg = "";
    const unitStr = unit ? " " + unit : "";
    if (p < 0.5 * first.min) {
        warning = true;
        warningMsg = `Показник "${paramName}" (${p}${unitStr}) менше половини мінімального (${first.min}${unitStr}). Відповідно до п. 2.6 Настанови, вартість визначається на підставі трудовитрат. Показано математичний розрахунок за п. 2.4.`;
    } else if (p > 2 * last.max) {
        warning = true;
        warningMsg = `Показник "${paramName}" (${p}${unitStr}) більше ніж удвічі перевищує максимальний (${last.max}${unitStr}). Відповідно до п. 2.6 Настанови, вартість визначається на підставі трудовитрат. Показано орієнтовний розрахунок за п. 2.5.`;
    }

    if (p < first.min) {
        const base = first.a + first.b * (0.4 * first.min + 0.6 * p);
        return {
            basePrice: base,
            note: `Екстраполяція в меншу сторону (п. 2.4): A + B × (0.4 × P_min + 0.6 × P_задано). Р_min = ${first.min}. A = ${first.a.toLocaleString()}, B = ${first.b.toLocaleString()}`,
            warning: warning,
            warningMsg: warningMsg
        };
    }

    if (p > last.max) {
        const base = last.a + last.b * (0.4 * last.max + 0.6 * p);
        return {
            basePrice: base,
            note: `Екстраполяція в більшу сторону (п. 2.5): A + B × (0.4 × P_max + 0.6 × P_задано). Р_max = ${last.max}. A = ${last.a.toLocaleString()}, B = ${last.b.toLocaleString()}`,
            warning: warning,
            warningMsg: warningMsg
        };
    }

    for (const interval of intervals) {
        if (p >= interval.min && p <= interval.max) {
            const base = interval.a + interval.b * p;
            return {
                basePrice: base,
                note: `Розрахунок за формулою п. 2.3: A + B × P для діапазону ${interval.min} - ${interval.max}. A = ${interval.a.toLocaleString()}, B = ${interval.b.toLocaleString()}`,
                warning: false
            };
        }
    }

    const closest = intervals[0];
    const base = closest.a + closest.b * p;
    return {
        basePrice: base,
        note: `Розраховано за найближчим діапазоном ${closest.min} - ${closest.max}.`,
        warning: false
    };
}

function combineCoefficients(coefList) {
    if (!coefList || coefList.length === 0) return 1.0;

    let posSum = 0;
    let posMultiplied = 1.0;
    let hasPosMultiplied = false;
    let negProduct = 1.0;
    let hasNeg = false;

    coefList.forEach(c => {
        if (c.value === 1.0) return;

        if (c.value > 1.0) {
            if (c.mustMultiply) {
                posMultiplied *= c.value;
                hasPosMultiplied = true;
            } else {
                posSum += (c.value - 1.0);
            }
        } else {
            negProduct *= c.value;
            hasNeg = true;
        }
    });

    let totalPos = 1.0 + posSum;
    if (hasPosMultiplied) {
        totalPos *= posMultiplied;
    }

    let total = totalPos;
    if (hasNeg) {
        total *= negProduct;
    }

    return total;
}

function calculateExpertise(costThousand) {
    if (costThousand <= 0) return { cost: 0, percent: 0 };

    let percent = 10.0;

    if (costThousand <= 100.0) {
        percent = 10.0;
    } else if (costThousand <= 500.0) {
        const ratio = (costThousand - 100.1) / (500.0 - 100.1);
        percent = 9.0 - ratio * (9.0 - 8.0);
    } else if (costThousand <= 1000.0) {
        const ratio = (costThousand - 500.1) / (1000.0 - 500.1);
        percent = 8.0 - ratio * (8.0 - 7.0);
    } else if (costThousand <= 2500.0) {
        const ratio = (costThousand - 1000.1) / (2500.0 - 1000.1);
        percent = 7.0 - ratio * (7.0 - 6.0);
    } else if (costThousand <= 5000.0) {
        const ratio = (costThousand - 2500.1) / (5000.0 - 2500.1);
        percent = 6.0 - ratio * (6.0 - 5.0);
    } else if (costThousand <= 7500.0) {
        const ratioCorrect = (costThousand - 5000.1) / (7500.0 - 5000.1);
        percent = 5.0 - ratioCorrect * (5.0 - 4.0);
    } else if (costThousand <= 10000.0) {
        const ratio = (costThousand - 7500.1) / (10000.0 - 7500.1);
        percent = 4.0 - ratio * (4.0 - 3.0);
    } else {
        percent = 3.0;
    }

    const costUah = (costThousand * 1000) * (percent / 100.0);
    return { cost: costUah, percent: percent };
}

// --- INTERACTIVE & THEME MANAGEMENT ---

let manualTheme = false;
let stepRepeatTimer = null;
let stepRepeatInterval = null;

function setupAnimatedDetails(detailsId) {
    const details = document.getElementById(detailsId);
    if (!details) return;

    const summary = details.querySelector('summary');
    const body = details.querySelector('.details-body-wrap');

    if (!summary || !body) return;

    if (details.open) {
        details.classList.add('is-open');
    } else {
        details.classList.remove('is-open');
    }
    let timer = null;

    function openDetails() {
        clearTimeout(timer);
        details.open = true;
        details.classList.add('is-open');

        body.style.maxHeight = '0px';
        body.style.opacity = '0';
        body.style.transform = 'translateY(-4px)';

        requestAnimationFrame(() => {
            body.style.maxHeight = `${body.scrollHeight}px`;
            body.style.opacity = '1';
            body.style.transform = 'translateY(0)';
        });

        timer = setTimeout(() => {
            body.style.maxHeight = 'none';
        }, 260);
    }

    function closeDetails() {
        clearTimeout(timer);
        details.classList.remove('is-open');

        body.style.maxHeight = `${body.scrollHeight}px`;
        body.style.opacity = '1';
        body.style.transform = 'translateY(0)';

        requestAnimationFrame(() => {
            body.style.maxHeight = '0px';
            body.style.opacity = '0';
            body.style.transform = 'translateY(-4px)';
        });

        timer = setTimeout(() => {
            details.open = false;
            body.style.maxHeight = '';
            body.style.opacity = '';
            body.style.transform = '';
        }, 260);
    }

    summary.addEventListener('click', (event) => {
        event.preventDefault();
        if (details.open) {
            closeDetails();
        } else {
            openDetails();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initTheme();
    initGuidebook();
    initSliders();
    // initCheckboxIcons(); // Inline SVGs are now hardcoded in index.html for better customization
    initEventListeners();
    initAutocomplete();
    setupAnimatedDetails('formulaDetails');
    restoreStateFromUrl();
    updateAutocompletePosition();
    calc(); // First run
});


function initTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const targetId = tab.getAttribute("data-target");
            const sections = document.querySelectorAll(".form-section");
            sections.forEach(s => s.classList.remove("active"));

            const activeSection = document.getElementById(targetId);
            if (activeSection) {
                activeSection.classList.add("active");
            }
            updateAutocompletePosition();
            calc(); // Recalculate
        });
    });
}

function initTheme() {
    const themeBtn = document.getElementById("themeBtn");
    if (!themeBtn) return;

    let currentTheme = localStorage.getItem("theme");
    if (!currentTheme) {
        const query = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
        currentTheme = query && query.matches ? 'dark' : 'light';
    }

    setTheme(currentTheme);

    themeBtn.addEventListener('click', () => {
        manualTheme = true;
        const newTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
}

function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
}

function initSliders() {
    const wrappers = document.querySelectorAll(".slider-wrapper");
    wrappers.forEach(wrapper => {
        const sliderInput = wrapper.querySelector('input[type="range"].slider-control');
        if (!sliderInput) return;

        const id = sliderInput.id;
        const defaultValue = parseInt(sliderInput.value) || 0;
        const minValue = parseInt(sliderInput.min) || 0;
        const maxValue = parseInt(sliderInput.max) || 1;

        // Populate tick texts from the clean full labels in SLIDER_MAPS (without K coefficient suffix)
        const tickTexts = [];
        if (SLIDER_MAPS[id]) {
            SLIDER_MAPS[id].forEach(item => {
                let cleanText = item.label.split(" (")[0];
                if (cleanText.includes(":")) {
                    cleanText = cleanText.split(":")[1].trim();
                }
                // Replace "пункт/пункти/пунктів" with "н. п." for compact button labels
                cleanText = cleanText
                    .replace(/пунктів/g, "н. п.")
                    .replace(/пункти/g, "н. п.")
                    .replace(/пункт/g, "н. п.");
                tickTexts.push(cleanText);
            });
        }

        // Create segmented tab container
        const controlDiv = document.createElement("div");
        controlDiv.className = "segmented-control";

        // Populate buttons
        const count = maxValue - minValue + 1;
        for (let i = 0; i < count; i++) {
            const val = minValue + i;
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "segment-btn";
            if (val === defaultValue) {
                btn.classList.add("active");
            }
            btn.textContent = tickTexts[i] || val.toString();
            btn.setAttribute("data-val", val);

            btn.addEventListener("click", () => {
                controlDiv.querySelectorAll(".segment-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                // Update original range slider value
                sliderInput.value = val;

                // Dispatch input events to trigger calculation updates
                sliderInput.dispatchEvent(new Event("input", { bubbles: true }));
                sliderInput.dispatchEvent(new Event("change", { bubbles: true }));

                updateLabelForId(id, val);
            });

            controlDiv.appendChild(btn);
        }

        // Hide original elements but keep sliderInput as state holder
        const ticksContainer = wrapper.querySelector(".slider-ticks-container");
        if (ticksContainer) ticksContainer.style.display = "none";
        sliderInput.style.display = "none";

        // Append control UI element
        wrapper.appendChild(controlDiv);

        updateLabelForId(id, defaultValue);
    });
}

function updateLabelForId(id, value) {
    const label = document.getElementById("label_" + id);
    if (label && SLIDER_MAPS[id]) {
        const item = SLIDER_MAPS[id][value] || SLIDER_MAPS[id][0];
        label.textContent = item.label;
    }
}

// initCheckboxIcons was removed because inline SVGs are now defined directly in index.html

function updateSliderLabels() {
    for (const id in SLIDER_MAPS) {
        const slider = document.getElementById(id);
        if (slider) {
            const val = parseInt(slider.value) || 0;
            updateLabelForId(id, val);

            const wrapper = slider.closest(".slider-wrapper");
            if (wrapper) {
                const buttons = wrapper.querySelectorAll(".segment-btn");
                buttons.forEach(btn => {
                    const btnVal = parseInt(btn.getAttribute("data-val"));
                    if (btnVal === val) {
                        btn.classList.add("active");
                    } else {
                        btn.classList.remove("active");
                    }
                });
            }
        }
    }
}

function getSliderValue(id) {
    const el = document.getElementById(id);
    if (!el) return 1.0;
    const idx = parseInt(el.value) || 0;
    const item = SLIDER_MAPS[id]?.[idx] || { val: 1.0 };
    return item.val;
}

/**
 * Auto-sync population number inputs to their corresponding sliders.
 * cp_pop_total → cp_f_pop (community population range)
 * gp_pop → gp_city_k (settlement type: normal / million+ / Kyiv)
 */
function initPopulationSliderSync() {
    // Комплексний план: населення громади → слайдер діапазону населення
    const cpPopInput = document.getElementById("cp_pop_total");
    const cpPopSlider = document.getElementById("cp_f_pop");
    if (cpPopInput && cpPopSlider) {
        cpPopInput.addEventListener("input", () => {
            const pop = parseFloat(cpPopInput.value) || 0; // тис. осіб
            let idx = 0;
            if (pop > 120) idx = 4;
            else if (pop > 60) idx = 3;
            else if (pop > 30) idx = 2;
            else if (pop > 10) idx = 1;
            else idx = 0;

            if (parseInt(cpPopSlider.value) !== idx) {
                cpPopSlider.value = idx;
                cpPopSlider.dispatchEvent(new Event("input", { bubbles: true }));
            }
        });
    }

    // Генеральний план: населення НП → слайдер типу НП
    const gpPopInput = document.getElementById("gp_pop");
    const gpCitySlider = document.getElementById("gp_city_k");
    if (gpPopInput && gpCitySlider) {
        gpPopInput.addEventListener("input", () => {
            const pop = parseFloat(gpPopInput.value) || 0; // тис. осіб
            let idx = 0; // звичайне місто/село
            if (pop >= 1000) idx = 1; // мільйонник

            if (parseInt(gpCitySlider.value) !== idx) {
                gpCitySlider.value = idx;
                gpCitySlider.dispatchEvent(new Event("input", { bubbles: true }));
            }
        });
    }
}

function initEventListeners() {
    const inputs = document.querySelectorAll("input, select");
    inputs.forEach(el => {
        el.addEventListener("input", calc);
        el.addEventListener("change", calc);
    });

    // Sync population inputs to corresponding sliders
    initPopulationSliderSync();

    // Top and Bottom Copy results triggers
    const copyBtns = [
        document.getElementById("copyResultBtn"),
        document.getElementById("copyResultBtnBottom")
    ];
    copyBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener("click", () => {
                const val = document.getElementById("resultMain").textContent;
                copyText(val, "Суму скопійовано в буфер обміну");
            });
        }
    });

    // Top and Bottom Share link triggers
    const shareBtns = [
        document.getElementById("shareResultBtn"),
        document.getElementById("shareResultBtnBottom")
    ];
    shareBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener("click", () => {
                copyText(window.location.href, "Посилання на розрахунок скопійовано!");
            });
        }
    });

    // Top and Bottom Save to Excel triggers
    const excelBtns = [
        document.getElementById("excelResultBtn"),
        document.getElementById("excelResultBtnBottom")
    ];
    excelBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener("click", () => {
                exportToExcel();
            });
        }
    });

    // Project Name clear button functionality
    const projectNameInput = document.getElementById("projectName");
    const projectNameClearBtn = document.getElementById("projectNameClearBtn");
    if (projectNameInput && projectNameClearBtn) {
        const updateProjectNameClearBtnVisibility = () => {
            projectNameClearBtn.style.display = projectNameInput.value.length > 0 ? "flex" : "none";
        };
        projectNameInput.addEventListener("input", updateProjectNameClearBtnVisibility);

        projectNameClearBtn.addEventListener("click", () => {
            projectNameInput.value = "";
            projectNameClearBtn.style.display = "none";
            projectNameInput.focus();
            projectNameInput.dispatchEvent(new Event("input", { bubbles: true }));
            projectNameInput.dispatchEvent(new Event("change", { bubbles: true }));
        });
    }

    // Scroll to breakdown trigger
    const scrollTrigger = document.getElementById("resultMainBottom");
    if (scrollTrigger) {
        scrollTrigger.addEventListener("click", () => {
            const dest = document.getElementById("outputBottom");
            if (dest) {
                const warningBox = dest.querySelector(".alert-warning-box");
                if (warningBox) {
                    warningBox.scrollIntoView({ behavior: "smooth", block: "end" });
                } else {
                    dest.scrollIntoView({ behavior: "smooth", block: "end" });
                }
            }
        });
    }

    // Top and Bottom PDF report triggers
    const pdfBtns = [
        document.getElementById("pdfResultBtn"),
        document.getElementById("pdfResultBtnBottom")
    ];
    pdfBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener("click", () => {
                window.print();
            });
        }
    });


    // Bind custom steppers repeat hold events
    document.querySelectorAll('.step-btn').forEach(button => {
        button.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            if (button.setPointerCapture) {
                button.setPointerCapture(event.pointerId);
            }
            startStepRepeat(button);
        });
        button.addEventListener('pointerup', stopStepRepeat);
        button.addEventListener('pointercancel', stopStepRepeat);
        button.addEventListener('lostpointercapture', stopStepRepeat);
        button.addEventListener('mouseleave', stopStepRepeat);
    });

    // Reset buttons logic for coefficients
    document.querySelectorAll(".btn-reset").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-reset-target");
            const input = document.getElementById(targetId);
            if (input) {
                const defVal = input.getAttribute("value") || "1.0";
                input.value = defVal;
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.dispatchEvent(new Event("change", { bubbles: true }));
            }
        });
    });
}

function resetAllInputs() {
    // Number inputs defaults
    const numDefaults = {
        kzag: "43.36", kzag_land: "39.66", kdir: "1.01",
        sp_area: "15.0", rr_area: "25.0", rd_area: "2.5",
        cp_area: "0.45", cp_pop_center: "12.5", cp_pop_other: "8.3", cp_pop_total: "20.8",
        gp_pop: "15.0", dp_area: "45.0"
    };
    for (const id in numDefaults) {
        const el = document.getElementById(id);
        if (el) el.value = numDefaults[id];
    }

    // Slider defaults
    const sliderDefaults = {
        sp_f_pop: 1, sp_f_urban: 0, sp_f_rural: 0, sp_f_cities100: 0,
        rr_f_pop: 1, rr_f_urban: 0, rr_f_rural: 0, rr_f_cities100: 0, rr_f_ind: 0, rr_f_forest: 0,
        rd_f_pop: 0, rd_f_urban: 0, rd_f_rural: 0, rd_f_ind: 0, rd_f_forest: 1,
        cp_f_pop: 1, cp_f_urban: 1, cp_f_rural: 0, cp_f_ind: 0, cp_f_users: 0,
        gp_city_k: 0, dp_scale_k: 0, dp_type_k: 0,
        sp_f_mil: 0, rr_f_mil: 0, rd_f_mil: 0, cp_f_mil: 0, gp_f_mil: 0, dp_f_mil: 0,
        sp_f_resort: 0, rr_f_resort: 0, rd_f_resort: 0, cp_f_resort: 0, gp_f_resort: 0, dp_f_resort: 0,
        dp_f_data: 0, dp_f_plots: 0, dp_f_zones: 0
    };
    for (const id in sliderDefaults) {
        const el = document.getElementById(id);
        if (el) el.value = sliderDefaults[id];
    }

    // Checkboxes defaults
    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(cb => {
        if (cb.id === "gp_use_expertise" || cb.id === "dp_use_expertise") {
            cb.checked = true;
        } else {
            cb.checked = false;
        }
    });

    const nameEl = document.getElementById("projectName");
    if (nameEl) nameEl.value = "";

    const centerPopInput = document.getElementById("cp_pop_center");
    if (centerPopInput) centerPopInput.classList.remove("is-invalid");

    updateSliderLabels();
    calc();
    showToast("Значення скинуто до початкових");
}

function startStepRepeat(button) {
    stopStepRepeat();
    const target = button.getAttribute("data-step-target");
    const direction = button.getAttribute("data-step-dir");
    stepInput(target, direction);
    stepRepeatTimer = setTimeout(() => {
        stepRepeatInterval = setInterval(() => stepInput(target, direction), 80);
    }, 360);
}

function getExpertiseMathHTML(finalCost, expPercent) {
    const costThousand = finalCost / 1000.0;
    let mathText = "";
    if (costThousand <= 100.0) {
        mathText = `оскільки вартість розроблення ${finalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })} грн (<b>${costThousand.toFixed(2)}</b> тис. грн) є меншою або дорівнює 100 тис. грн, відсоток експертизи становить фіксовані <b>10.0%</b>.`;
    } else if (costThousand <= 500.0) {
        const ratio = (costThousand - 100.1) / (500.0 - 100.1);
        mathText = `інтервал від 100.1 до 500.0 тис. грн (плавне зменшення від 9% до 8%):<br>
        <code>Коеф. інтерполяції = (${costThousand.toFixed(2)} - 100.1) / (500.0 - 100.1) = ${ratio.toFixed(4)}</code><br>
        <code>Відсоток = 9.0 - ${ratio.toFixed(4)} × (9.0 - 8.0) = <b>${expPercent.toFixed(2)}%</b></code>`;
    } else if (costThousand <= 1000.0) {
        const ratio = (costThousand - 500.1) / (1000.0 - 500.1);
        mathText = `інтервал від 500.1 до 1000.0 тис. грн (плавне зменшення від 8% до 7%):<br>
        <code>Коеф. інтерполяції = (${costThousand.toFixed(2)} - 500.1) / (1000.0 - 500.1) = ${ratio.toFixed(4)}</code><br>
        <code>Відсоток = 8.0 - ${ratio.toFixed(4)} × (8.0 - 7.0) = <b>${expPercent.toFixed(2)}%</b></code>`;
    } else if (costThousand <= 2500.0) {
        const ratio = (costThousand - 1000.1) / (2500.0 - 1000.1);
        mathText = `інтервал від 1000.1 до 2500.0 тис. грн (плавне зменшення від 7% до 6%):<br>
        <code>Коеф. інтерполяції = (${costThousand.toFixed(2)} - 1000.1) / (2500.0 - 1000.1) = ${ratio.toFixed(4)}</code><br>
        <code>Відсоток = 7.0 - ${ratio.toFixed(4)} × (7.0 - 6.0) = <b>${expPercent.toFixed(2)}%</b></code>`;
    } else if (costThousand <= 5000.0) {
        const ratio = (costThousand - 2500.1) / (5000.0 - 2500.1);
        mathText = `інтервал від 2500.1 до 5000.0 тис. грн (плавне зменшення від 6% до 5%):<br>
        <code>Коеф. інтерполяції = (${costThousand.toFixed(2)} - 2500.1) / (5000.0 - 2500.1) = ${ratio.toFixed(4)}</code><br>
        <code>Відсоток = 6.0 - ${ratio.toFixed(4)} × (6.0 - 5.0) = <b>${expPercent.toFixed(2)}%</b></code>`;
    } else if (costThousand <= 7500.0) {
        const ratio = (costThousand - 5000.1) / (7500.0 - 5000.1);
        mathText = `інтервал від 5000.1 до 7500.0 тис. грн (плавне зменшення від 5% до 4%):<br>
        <code>Коеф. інтерполяції = (${costThousand.toFixed(2)} - 5000.1) / (7500.0 - 5000.1) = ${ratio.toFixed(4)}</code><br>
        <code>Відсоток = 5.0 - ${ratio.toFixed(4)} × (5.0 - 4.0) = <b>${expPercent.toFixed(2)}%</b></code>`;
    } else if (costThousand <= 10000.0) {
        const ratio = (costThousand - 7500.1) / (10000.0 - 7500.1);
        mathText = `інтервал від 7500.1 до 10000.0 тис. грн (плавне зменшення від 4% до 3%):<br>
        <code>Коеф. інтерполяції = (${costThousand.toFixed(2)} - 7500.1) / (10000.0 - 7500.1) = ${ratio.toFixed(4)}</code><br>
        <code>Відсоток = 4.0 - ${ratio.toFixed(4)} × (4.0 - 3.0) = <b>${expPercent.toFixed(2)}%</b></code>`;
    } else {
        mathText = `оскільки вартість розроблення ${finalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })} грн (<b>${costThousand.toFixed(2)}</b> тис. грн) є більшою за 10000 тис. грн, відсоток експертизи становить фіксовані <b>3.0%</b>.`;
    }
    return mathText;
}

function stopStepRepeat() {
    clearTimeout(stepRepeatTimer);
    clearInterval(stepRepeatInterval);
    stepRepeatTimer = null;
    stepRepeatInterval = null;
}

function stepInput(targetId, direction) {
    const input = document.getElementById(targetId);
    if (!input) return;
    const current = parseFloat(input.value) || 0;
    const step = parseFloat(input.step) || 1;
    let next = current + (direction === 'up' ? step : -step);

    const minVal = parseFloat(input.getAttribute("min"));
    if (!isNaN(minVal) && next < minVal) {
        next = minVal;
    }

    const decimals = (input.step && input.step.includes('.')) ? input.step.split('.')[1].length : 0;
    input.value = next.toFixed(decimals);

    input.dispatchEvent(new Event('input', { bubbles: true }));
}

async function copyText(text, successMsg) {
    const cleanedText = text.replace("Всього: ", "").trim();
    try {
        await navigator.clipboard.writeText(cleanedText);
    } catch {
        const area = document.createElement('textarea');
        area.value = cleanedText;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
    }
    showToast(successMsg);
}

function showToast(message) {
    const toastEl = document.getElementById("toast");
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

// --- FORM DATA RETRIEVAL ---

function getComplicatingFactors(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];

    const list = [];
    const checkboxes = container.querySelectorAll("input[type='checkbox']:checked");
    checkboxes.forEach(cb => {
        const val = parseFloat(cb.getAttribute("data-coef"));
        const mustMultiply = cb.getAttribute("data-multiply") === "true";
        if (!isNaN(val)) {
            list.push({ value: val, mustMultiply: mustMultiply });
        }
    });
    return list;
}

function getInputValue(id, defaultValue = 0) {
    const el = document.getElementById(id);
    if (!el) return defaultValue;
    const val = parseFloat(el.value);
    return isNaN(val) ? defaultValue : val;
}

function formatCurrency(val) {
    return val.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " грн";
}

// --- UPDATE FORMULA DETAILS WINDOW ---

function updateFormulaBox(docType, data) {
    const formulaBox = document.getElementById("formulaBox");
    if (!formulaBox) return;

    let content = "";

    if (docType === "stateParts" || docType === "regionalRegion" || docType === "regionalDistrict") {
        const baseCalc = data.a + data.b * data.p;
        const finalCalc = baseCalc * data.K * data.Kzag * data.Kdir;
        const name = docType === "stateParts" ? "Схеми планування окремої частини України" : docType === "regionalRegion" ? "Схеми планування території області" : "Схеми планування території району";
        const table = docType === "stateParts" ? "Таблиці 3-1" : docType === "regionalRegion" ? "Таблиці 4-1" : "Таблиці 4-3";
        content = `
            <strong>Розрахунок ${name}</strong><br>
            Формула (п. 2.3): <code>C = (A + B × P) × Кзаг × К × Кдир</code><br><br>
            <strong>Математичний розрахунок за введеними даними:</strong><br>
            <code>C = (${data.a.toLocaleString()} + ${data.b.toLocaleString()} × ${data.p}) × ${data.Kzag} × ${data.K.toFixed(4)} × ${data.Kdir}</code><br>
            <code>C = ${baseCalc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × ${data.Kzag} × ${data.K.toFixed(4)} × ${data.Kdir} = <b>${finalCalc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн</code><br><br>
            <strong>Поточні значення змінних:</strong><br>
            • <code>P</code> (площа) = <b>${data.p}</b> тис. км²<br>
            • <code>A</code> = <b>${data.a.toLocaleString()}</b> грн, <code>B</code> = <b>${data.b.toLocaleString()}</b> грн (з ${table})<br>
            • <code>Кзаг</code> = <b>${data.Kzag.toFixed(2)}</b> (індекс переходу)<br>
            • <code>Кдир</code> = <b>${data.Kdir.toFixed(2)}</b> (частка прямих витрат)<br>
            • <code>К</code> = <b>${data.K.toFixed(4)}</b> (коефіцієнт складності)<br><br>
            <em>Примітки:</em> ${data.notes || "немає"}
        `;
    } else if (docType === "localComplexPlan") {
        content = `
            <strong>Розрахунок Комплексного плану просторового розвитку громади (місцевий рівень)</strong><br>
            Формула (п. 2.2): <code>C = C_містобуд + C_землевпоряд</code><br><br>

            <strong>1. МІСТОБУДІВНА ЧАСТИНА (п. 2.9):</strong><br>
            <code>C_містобуд = (С_площі + С_адмінцентру + С_інших_нп) × К_містобуд × Кзаг × Кдир</code><br>
            • <code>С_площі</code> (від площі громади ${data.areaComplex} тис. км²): <b>${data.m1.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн<br>
            • <code>С_адмінцентру</code> (від населення адмінцентру ${data.popCenter} тис. осіб): <b>${data.m2.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн<br>
            • <code>С_інших_нп</code> (від населення інших нп ${data.popOther.toFixed(1)} тис. осіб): <b>${data.m3.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн<br>
            <code>C_містобуд = (${data.m1.toLocaleString(undefined, { maximumFractionDigits: 2 })} + ${data.m2.toLocaleString(undefined, { maximumFractionDigits: 2 })} + ${data.m3.toLocaleString(undefined, { maximumFractionDigits: 2 })}) × ${data.K_mist.toFixed(4)} × ${data.globalKzag.toFixed(2)} × ${data.globalKdir.toFixed(2)}</code><br>
            <code>C_містобуд = ${(data.m1 + data.m2 + data.m3).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × ${data.K_mist.toFixed(4)} × ${data.globalKzag.toFixed(2)} × ${data.globalKdir.toFixed(2)} = <b>${data.mistCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн</code><br><br>

            <strong>2. ЗЕМЛЕВПОРЯДНА ЧАСТИНА (п. 6.1):</strong><br>
            <code>C_землевпоряд = (С_населення + С_площі_зем) × К_землевпоряд × Кзаг_зем × Кдир</code><br>
            • <code>С_населення</code> (населення громади ${data.popComplex} тис. осіб, К3=${data.K3}, К4=${data.K4}):<br>
              <code>С_населення = BasePrice × 1000 × K3 × K4</code><br>
              <code>С_населення = ${data.z1Base.toLocaleString()} × 1000 × ${data.K3} × ${data.K4} = <b>${data.z1.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн</code><br>
            • <code>С_площі_зем</code> (площа громади ${data.areaLandComplex.toFixed(1)} км²):<br>
              <code>С_площі_зем = BasePrice × 1000</code><br>
              <code>С_площі_зем = ${data.z2.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} грн</code><br>
            <code>C_землевпоряд = (${data.z1.toLocaleString(undefined, { maximumFractionDigits: 2 })} + ${data.z2.toLocaleString(undefined, { maximumFractionDigits: 2 })}) × ${data.K_land.toFixed(4)} × ${data.kzagLand.toFixed(2)} × ${data.globalKdir.toFixed(2)}</code><br>
            <code>C_землевпоряд = ${(data.z1 + data.z2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × ${data.K_land.toFixed(4)} × ${data.kzagLand.toFixed(2)} × ${data.globalKdir.toFixed(2)} = <b>${data.landCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн</code><br><br>

            <strong>ЗАГАЛЬНА ВАРТІСТЬ:</strong><br>
            <code>C = C_містобуд + C_землевпоряд</code><br>
            <code>C = ${data.mistCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} + ${data.landCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = <b>${data.finalDocCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн</code>
        `;
    } else if (docType === "localGeneralPlan") {
        const baseCalc = data.a + data.b * data.p;
        const finalCalc = baseCalc * data.K * data.Kzag * data.Kdir;
        content = `
            <strong>Розрахунок Генерального плану населеного пункту</strong><br>
            Формула (п. 2.3): <code>C = (A + B × P) × Кзаг × К × Кдир</code><br><br>
            <strong>Математичний розрахунок за введеними даними:</strong><br>
            <code>C = (${data.a.toLocaleString()} + ${data.b.toLocaleString()} × ${data.p}) × ${data.Kzag} × ${data.K.toFixed(4)} × ${data.Kdir}</code><br>
            <code>C = ${baseCalc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × ${data.Kzag} × ${data.K.toFixed(4)} × ${data.Kdir} = <b>${finalCalc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн</code><br><br>
            <strong>Поточні значення змінних:</strong><br>
            • <code>P</code> (населення) = <b>${data.p}</b> тис. осіб<br>
            • <code>A</code> = <b>${data.a.toLocaleString()}</b> грн, <code>B</code> = <b>${data.b.toLocaleString()}</b> грн (з Таблиці 5-3)<br>
            • <code>Кзаг</code> = <b>${data.Kzag.toFixed(2)}</b> (містобудівний індекс)<br>
            • <code>Кдир</code> = <b>${data.Kdir.toFixed(2)}</b> (частка прямих витрат)<br>
            • <code>К</code> = <b>${data.K.toFixed(4)}</b> (з урахуванням п. 5.10 для міст-мільйонників/Києва)<br><br>
            <em>Примітки:</em> ${data.notes || "немає"}
        `;
    } else if (docType === "localDetailedPlan") {
        content = `
            <strong>Розрахунок Детального плану території (ДПТ)</strong><br>
            Формула (п. 2.2): <code>C = C_містобуд + C_землевпоряд</code><br><br>

            <strong>1. МІСТОБУДІВНА СКЛАДОВА (Таблиця 5-4):</strong><br>
            <code>C_містобуд = C_базова_містобуд × К_містобуд × Кзаг × Кдир</code><br>
            • <code>C_базова_містобуд</code> (від площі ДПТ ${data.area} га): <b>${data.baseMist.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн<br>
            <code>C_містобуд = ${data.baseMist.toLocaleString(undefined, { maximumFractionDigits: 2 })} × ${data.K_mist.toFixed(4)} × ${data.globalKzag.toFixed(2)} × ${data.globalKdir.toFixed(2)} = <b>${data.mistCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн</code><br><br>

            <strong>2. ЗЕМЛЕВПОРЯДНА СКЛАДОВА (Таблиця 6-5):</strong><br>
            <code>C_землевпоряд = C_базова_землевп × К_землевпоряд × Кзаг_зем × Кдир</code><br>
            • <code>C_базова_землевп</code> (від площі ДПТ ${data.area} га): <b>${data.baseLand.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн<br>
            <code>C_землевпоряд = ${data.baseLand.toLocaleString(undefined, { maximumFractionDigits: 2 })} × ${data.K_land.toFixed(4)} × ${data.kzagLand.toFixed(2)} × ${data.globalKdir.toFixed(2)} = <b>${data.landCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн</code><br><br>

            <strong>ЗАГАЛЬНА ВАРТІСТЬ:</strong><br>
            <code>C = C_містобуд + C_землевпоряд</code><br>
            <code>C = ${data.mistCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} + ${data.landCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = <b>${data.finalDocCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн</code>
        `;
    }

    if (data.needsExpertise) {
        const extMath = getExpertiseMathHTML(data.finalDocCost || data.mistCost + data.landCost, data.expPercent);
        content += `
            <br><hr style="border: 0; border-top: 1px solid var(--line); margin: 12px 0;">
            <strong>РОЗРАХУНОК ВАРТОСТІ ЕКСПЕРТИЗИ (Таблиця 2-2):</strong><br>
            • ${extMath}<br>
            • Розрахунок вартості: <code>C_експертизи = C_документації × Відсоток</code><br>
            <code>C_експертизи = ${(data.finalDocCost || data.mistCost + data.landCost).toLocaleString(undefined, { maximumFractionDigits: 2 })} × ${data.expPercent.toFixed(2)}% = <b>${data.expCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн</code>
        `;
    } else {
        content += `
            <br><hr style="border: 0; border-top: 1px solid var(--line); margin: 12px 0;">
            <strong>ЕКСПЕРТИЗА ПРОЄКТНОЇ ДОКУМЕНТАЦІЇ:</strong><br>
            Згідно з налаштуваннями калькулятора або чинним законодавством, експертиза для этого об'єкта <b>не проводиться</b>.
        `;
    }

    if (data.useVat) {
        const vatBase = (data.finalDocCost || data.mistCost + data.landCost) + (data.needsExpertise ? data.expCost : 0);
        content += `
            <br><hr style="border: 0; border-top: 1px solid var(--line); margin: 12px 0;">
            <strong>РОЗРАХУНОК ПДВ (20%):</strong><br>
            <code>ПДВ = (Вартість розроблення + Вартість експертизи) × 20%</code><br>
            <code>ПДВ = ${vatBase.toLocaleString(undefined, { maximumFractionDigits: 2 })} × 20% = <b>${data.vatSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн</code><br><br>
            <strong>ЗАГАЛЬНА СУМА З ПДВ:</strong><br>
            <code>Всього = ${vatBase.toLocaleString(undefined, { maximumFractionDigits: 2 })} + ${data.vatSum.toLocaleString(undefined, { maximumFractionDigits: 2 })} = <b>${data.totalWithVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> грн</code>
        `;
    }

    formulaBox.innerHTML = linkifyReferences(content);
}


// --- DYNAMIC CALCULATOR EXECUTOR ---

function calc() {
    const activeTab = document.querySelector(".tab-btn.active");
    if (!activeTab) return;

    const docType = activeTab.getAttribute("data-target");

    // Show/hide Kzag land row and update label text based on active docType
    const kzagLandRow = document.getElementById("kzagLandRow");
    const kzagLabel = document.getElementById("kzagLabel");
    if (kzagLandRow && kzagLabel) {
        const tooltipHTML = ` <span class="tooltip-trigger" data-tooltip="Наведений в пункті 2 (проєктно-планувальні роботи) таблиці 3 додатку 7 Настанови з визначення вартості проєктних, науково-проєктних, вишукувальних робіт та експертизи проєктної документації на будівництво.">i</span>`;
        if (docType === "localComplexPlan" || docType === "localDetailedPlan") {
            kzagLandRow.style.display = "";
            kzagLabel.innerHTML = `Коефіцієнт Кзаг<br><span style="color: var(--real-text);">(містобудівна частина)</span>:${tooltipHTML}`;
        } else {
            kzagLandRow.style.display = "none";
            kzagLabel.innerHTML = `Коефіцієнт Кзаг:${tooltipHTML}`;
        }
    }

    // Clear previous field warning icons
    document.querySelectorAll(".field-warning-icon").forEach(el => el.innerHTML = "");
    let warningFieldId = "";
    let formulaData = {};

    const output = document.getElementById("output");
    const outputBottom = document.getElementById("outputBottom");

    const resultMain = document.getElementById("resultMain");
    const resultMainBottom = document.getElementById("resultMainBottom");

    const globalKzag = getInputValue("kzag", 1.0);
    const kzagLand = getInputValue("kzag_land", 1.0);
    const globalKdir = getInputValue("kdir", 1.0);
    const useVat = document.getElementById("useVat") ? document.getElementById("useVat").checked : false;

    let html = "";
    let alertText = "";
    let hasAlert = false;

    let baseSum = 0;
    let finalDocCost = 0;
    let mistCost = 0;
    let landCost = 0;

    if (docType === "stateParts") {
        const p = getInputValue("sp_area", 0);
        const res = calculateBasePrice(p, TARIFFS.stateParts, "Площа території", "тис. км²");
        baseSum = res.basePrice;

        if (res.warning) {
            hasAlert = true;
            alertText = res.warningMsg;
            warningFieldId = "sp_area";
        }

        // Get slider coefficients
        const f1 = getSliderValue("sp_f_pop");
        const f2 = getSliderValue("sp_f_urban");
        const f3 = getSliderValue("sp_f_rural");
        const f4 = getSliderValue("sp_f_cities100");
        const f_mil = getSliderValue("sp_f_mil");
        const f_resort = getSliderValue("sp_f_resort");
        const genCoefs = getComplicatingFactors("sp_gen_coefs");

        const tableCoefs = [
            { value: f1, mustMultiply: false },
            { value: f2, mustMultiply: false },
            { value: f3, mustMultiply: false },
            { value: f4, mustMultiply: false },
            { value: f_mil, mustMultiply: false },
            { value: f_resort, mustMultiply: true },
            ...genCoefs
        ];

        const K = combineCoefficients(tableCoefs);
        finalDocCost = baseSum * K * globalKzag * globalKdir;

        let activeA = 0, activeB = 0;
        const currentRange = TARIFFS.stateParts.find(r => p >= r.min && p <= r.max) || TARIFFS.stateParts[0];
        activeA = currentRange.a;
        activeB = currentRange.b;

        formulaData = { p, a: activeA, b: activeB, K, Kzag: globalKzag, Kdir: globalKdir, notes: res.note, finalDocCost };

        html = `
            <div class="result-sub-row">
                <span class="result-sub-label">Базова вартість за п. 2.3:</span>
                <span>${formatCurrency(baseSum)}</span>
            </div>
            <div class="result-sub-row">
                <span class="result-sub-label">Сумарний коефіцієнт (К):</span>
                <span>${K.toFixed(4)}</span>
            </div>
            <div class="result-sub-row">
                <span class="result-sub-label">Вартість розроблення (без ПДВ):</span>
                <span class="result-value real">${formatCurrency(finalDocCost)}</span>
            </div>
        `;

    } else if (docType === "regionalRegion") {
        const p = getInputValue("rr_area", 0);
        const res = calculateBasePrice(p, TARIFFS.regionalRegion, "Площа території", "тис. км²");
        baseSum = res.basePrice;

        if (res.warning) {
            hasAlert = true;
            alertText = res.warningMsg;
            warningFieldId = "rr_area";
        }

        // Sliders
        const f1 = getSliderValue("rr_f_pop");
        const f2 = getSliderValue("rr_f_urban");
        const f3 = getSliderValue("rr_f_rural");
        const f4 = getSliderValue("rr_f_cities100");
        const f5 = getSliderValue("rr_f_ind");
        const f6 = getSliderValue("rr_f_forest");
        const f_mil = getSliderValue("rr_f_mil");
        const f_resort = getSliderValue("rr_f_resort");
        const genCoefs = getComplicatingFactors("rr_gen_coefs");

        const tableCoefs = [
            { value: f1, mustMultiply: false },
            { value: f2, mustMultiply: false },
            { value: f3, mustMultiply: false },
            { value: f4, mustMultiply: false },
            { value: f5, mustMultiply: false },
            { value: f6, mustMultiply: false },
            { value: f_mil, mustMultiply: false },
            { value: f_resort, mustMultiply: true },
            ...genCoefs
        ];

        const K = combineCoefficients(tableCoefs);
        finalDocCost = baseSum * K * globalKzag * globalKdir;

        let activeA = 0, activeB = 0;
        const currentRange = TARIFFS.regionalRegion.find(r => p >= r.min && p <= r.max) || TARIFFS.regionalRegion[0];
        activeA = currentRange.a;
        activeB = currentRange.b;

        formulaData = { p, a: activeA, b: activeB, K, Kzag: globalKzag, Kdir: globalKdir, notes: res.note, finalDocCost };

        html = `
            <div class="result-sub-row">
                <span class="result-sub-label">Базова вартість за п. 2.3:</span>
                <span>${formatCurrency(baseSum)}</span>
            </div>
            <div class="result-sub-row">
                <span class="result-sub-label">Сумарний коефіцієнт (К):</span>
                <span>${K.toFixed(4)}</span>
            </div>
            <div class="result-sub-row">
                <span class="result-sub-label">Вартість розроблення (без ПДВ):</span>
                <span class="result-value real">${formatCurrency(finalDocCost)}</span>
            </div>
        `;

    } else if (docType === "regionalDistrict") {
        const p = getInputValue("rd_area", 0);
        const res = calculateBasePrice(p, TARIFFS.regionalDistrict, "Площа території", "тис. км²");
        baseSum = res.basePrice;

        if (res.warning) {
            hasAlert = true;
            alertText = res.warningMsg;
            warningFieldId = "rd_area";
        }

        // Sliders
        const f1 = getSliderValue("rd_f_pop");
        const f2 = getSliderValue("rd_f_urban");
        const f3 = getSliderValue("rd_f_rural");
        const f4 = getSliderValue("rd_f_ind");
        const f5 = getSliderValue("rd_f_forest");
        const f_mil = getSliderValue("rd_f_mil");
        const f_resort = getSliderValue("rd_f_resort");
        const genCoefs = getComplicatingFactors("rd_gen_coefs");

        const tableCoefs = [
            { value: f1, mustMultiply: false },
            { value: f2, mustMultiply: false },
            { value: f3, mustMultiply: false },
            { value: f4, mustMultiply: false },
            { value: f5, mustMultiply: false },
            { value: f_mil, mustMultiply: false },
            { value: f_resort, mustMultiply: true },
            ...genCoefs
        ];

        const K = combineCoefficients(tableCoefs);
        finalDocCost = baseSum * K * globalKzag * globalKdir;

        let activeA = 0, activeB = 0;
        const currentRange = TARIFFS.regionalDistrict.find(r => p >= r.min && p <= r.max) || TARIFFS.regionalDistrict[0];
        activeA = currentRange.a;
        activeB = currentRange.b;

        formulaData = { p, a: activeA, b: activeB, K, Kzag: globalKzag, Kdir: globalKdir, notes: res.note, finalDocCost };

        html = `
            <div class="result-sub-row">
                <span class="result-sub-label">Базова вартість за п. 2.3:</span>
                <span>${formatCurrency(baseSum)}</span>
            </div>
            <div class="result-sub-row">
                <span class="result-sub-label">Сумарний коефіцієнт (К):</span>
                <span>${K.toFixed(4)}</span>
            </div>
            <div class="result-sub-row">
                <span class="result-sub-label">Вартість розроблення (без ПДВ):</span>
                <span class="result-value real">${formatCurrency(finalDocCost)}</span>
            </div>
        `;

    } else if (docType === "localComplexPlan") {
        // МІСТОБУДІВНА ЧАСТИНА (тис. км2)
        const areaComplex = getInputValue("cp_area", 0);
        const resArea = calculateBasePrice(areaComplex, TARIFFS.localComplexArea, "Площа громади", "тис. км²");
        let m1 = resArea.basePrice;
        if (resArea.warning) {
            hasAlert = true;
            alertText += (alertText ? "<br>" : "") + "Містобудівна частина (площа): " + resArea.warningMsg;
            warningFieldId = "cp_area";
        }

        const popTotal = getInputValue("cp_pop_total", 0);
        const popCenter = getInputValue("cp_pop_center", 0);
        const popCenterInput = document.getElementById("cp_pop_center");

        if (popTotal < popCenter) {
            if (popCenterInput) popCenterInput.classList.add("is-invalid");
            hasAlert = true;
            alertText = "Помилка розрахунку: Населення всієї громади (Табл. 6-1) не може бути меншим за населення адміністративного центру (Табл. 5-3)! Будь ласка, скоригуйте значення.";
            warningFieldId = "cp_pop_center";

            html = `
                <div style="margin: 10px 0; padding: 12px; background: var(--error-bg, #fef2f2); border: 1px solid var(--error, #dc2626); border-radius: var(--radius-sm); color: var(--error-text, #991b1b); font-size: 13px; font-weight: 600; line-height: 1.4;">
                    ${alertText}
                </div>
            `;
            output.innerHTML = linkifyReferences(html);
            outputBottom.innerHTML = linkifyReferences(html);

            const errorHtml = `<span class="result-value result-nowrap" style="color: var(--error-text, #991b1b); border: 1px solid var(--error, #dc2626); background: var(--error-bg, #fef2f2);">Помилка розрахунку</span>`;
            resultMain.innerHTML = errorHtml;
            resultMainBottom.innerHTML = errorHtml;

            // Додаємо іконку попередження біля показника
            const warningIconContainer = document.getElementById("warning_cp_pop_center");
            if (warningIconContainer) {
                warningIconContainer.innerHTML = `
                    <span class="warning-tooltip-trigger" data-tooltip="${alertText.replace(/"/g, '&quot;')}" style="color: var(--error);">
                        <svg class="icon" style="width: 16px; height: 16px; stroke: currentColor; fill: none;">
                            <use href="#i-warning"></use>
                        </svg>
                    </span>
                `;
            }

            window.lastCalc = {
                docType: docType,
                docTypeName: activeTab.textContent,
                projectName: document.getElementById("projectName")?.value || "",
                globalKzag: globalKzag,
                kzagLand: kzagLand,
                globalKdir: globalKdir,
                useVat: useVat,
                mistCost: 0,
                landCost: 0,
                expCost: 0,
                expPercent: 0,
                vatSum: 0,
                totalWithVat: 0,
                alertText: alertText
            };
            updateUrlFromState();
            generatePrintReport();
            return;
        } else {
            if (popCenterInput) popCenterInput.classList.remove("is-invalid");
        }

        const popOther = popTotal - popCenter;
        const popOtherEl = document.getElementById("cp_pop_other");
        if (popOtherEl) {
            popOtherEl.value = popOther.toFixed(1);
        }

        const resCenter = calculateBasePrice(popCenter, TARIFFS.localGeneralPlan, "Населення адмінцентру", "тис. осіб");
        let m2 = resCenter.basePrice;
        if (resCenter.warning) {
            hasAlert = true;
            alertText += (alertText ? "<br>" : "") + "Містобудівна частина (адмінцентр): " + resCenter.warningMsg;
            warningFieldId = "cp_pop_center";
        }

        const resOther = calculateBasePrice(popOther, TARIFFS.localGeneralPlan, "Населення інших н.п.", "тис. осіб");
        let m3 = resOther.basePrice;
        if (resOther.warning) {
            hasAlert = true;
            alertText += (alertText ? "<br>" : "") + "Містобудівна частина (інші н.п.): " + resOther.warningMsg;
            warningFieldId = "cp_pop_total";
        }

        // Sliders
        const f1 = getSliderValue("cp_f_pop");
        const f2 = getSliderValue("cp_f_urban");
        const f3 = getSliderValue("cp_f_rural");
        const f4 = getSliderValue("cp_f_ind");
        const f_mil = getSliderValue("cp_f_mil");
        const f_resort = getSliderValue("cp_f_resort");
        const cpGenCoefs = getComplicatingFactors("cp_gen_coefs");
        const cpTableCoefs = [
            { value: f1, mustMultiply: false },
            { value: f2, mustMultiply: false },
            { value: f3, mustMultiply: false },
            { value: f4, mustMultiply: false },
            { value: f_mil, mustMultiply: false },
            { value: f_resort, mustMultiply: true },
            ...cpGenCoefs
        ];
        const K_mist = combineCoefficients(cpTableCoefs);
        mistCost = (m1 + m2 + m3) * K_mist * globalKzag * globalKdir;

        // ЗЕМЛЕВПОРЯДНА ЧАСТИНА
        const popComplex = getInputValue("cp_pop_total", 0);
        const resLandPop = calculateBasePrice(popComplex, TARIFFS.localComplexLandPop, "Населення громади (землевпоряд.)", "тис. осіб");
        let z1 = resLandPop.basePrice;
        if (resLandPop.warning) {
            hasAlert = true;
            alertText += (alertText ? "<br>" : "") + "Землевпорядна частина (населення): " + resLandPop.warningMsg;
            warningFieldId = "cp_pop_total";
        }

        // Sliders
        const K3 = getSliderValue("cp_f_users");
        const K4 = document.getElementById("cp_f_categories").checked ? 1.1 : 1.0;
        z1 = z1 * K3 * K4;

        const areaLandComplex = areaComplex * 1000;
        const resLandArea = calculateBasePrice(areaLandComplex, TARIFFS.localComplexLandArea, "Площа громади (землевпоряд.)", "га");
        let z2 = resLandArea.basePrice;
        if (resLandArea.warning) {
            hasAlert = true;
            alertText += (alertText ? "<br>" : "") + "Землевпорядна частина (площа): " + resLandArea.warningMsg;
            warningFieldId = "cp_area";
        }

        const landCoefs = getComplicatingFactors("cp_land_coefs");
        const K_land = combineCoefficients(landCoefs);
        landCost = (z1 + z2) * K_land * kzagLand * globalKdir;

        finalDocCost = mistCost + landCost;

        formulaData = {
            areaComplex, m1, popCenter, m2, popOther, m3,
            K_mist, globalKzag, globalKdir, mistCost,
            popComplex, z1, z1Base: resLandPop.basePrice, K3, K4,
            areaLandComplex, z2, K_land, kzagLand, landCost,
            finalDocCost
        };

        html = `
            <div class="result-sub-row" style="font-weight:600; color:var(--real-text);">
                <span>1. Містобудівна складова:</span>
                <span class="result-value real">${formatCurrency(mistCost)}</span>
            </div>
            <div class="result-sub-row" style="padding-left:15px; font-size:11.5px;">
                <span>• Базова містобудівна (м1+м2+м3):</span>
                <span>${formatCurrency(m1 + m2 + m3)}</span>
            </div>
            <div class="result-sub-row" style="padding-left:15px; font-size:11.5px;">
                <span>• Коефіцієнт містобудівний (К):</span>
                <span>${K_mist.toFixed(4)}</span>
            </div>

            <div class="result-sub-row" style="font-weight:600; color:var(--drawing-text); margin-top:5px;">
                <span>2. Землевпорядна складова:</span>
                <span class="result-value drawing">${formatCurrency(landCost)}</span>
            </div>
            <div class="result-sub-row" style="padding-left:15px; font-size:11.5px;">
                <span>• Базова землевпорядна (з1+з2):</span>
                <span>${formatCurrency(z1 + z2)}</span>
            </div>
            <div class="result-sub-row" style="padding-left:15px; font-size:11.5px;">
                <span>• Коефіцієнт землевпорядний (К):</span>
                <span>${K_land.toFixed(4)}</span>
            </div>
        `;

    } else if (docType === "localGeneralPlan") {
        const p = getInputValue("gp_pop", 0);
        const res = calculateBasePrice(p, TARIFFS.localGeneralPlan, "Населення НП", "тис. осіб");
        baseSum = res.basePrice;

        if (res.warning) {
            hasAlert = true;
            alertText = res.warningMsg;
            warningFieldId = "gp_pop";
        }

        // Sliders
        const gpCityK = getSliderValue("gp_city_k");
        const f_mil = getSliderValue("gp_f_mil");
        const f_resort = getSliderValue("gp_f_resort");
        const genCoefs = getComplicatingFactors("gp_gen_coefs");

        const K = combineCoefficients([
            { value: gpCityK, mustMultiply: true },
            { value: f_mil, mustMultiply: false },
            { value: f_resort, mustMultiply: true },
            ...genCoefs
        ]);

        finalDocCost = baseSum * K * globalKzag * globalKdir;

        let activeA = 0, activeB = 0;
        const currentRange = TARIFFS.localGeneralPlan.find(r => p >= r.min && p <= r.max) || TARIFFS.localGeneralPlan[0];
        activeA = currentRange.a;
        activeB = currentRange.b;

        formulaData = { p, a: activeA, b: activeB, K, Kzag: globalKzag, Kdir: globalKdir, notes: res.note, finalDocCost };

        html = `
            <div class="result-sub-row">
                <span class="result-sub-label">Базова вартість за Табл. 5-3:</span>
                <span>${formatCurrency(baseSum)}</span>
            </div>
            <div class="result-sub-row">
                <span class="result-sub-label">Коефіцієнт ускладнення (К):</span>
                <span>${K.toFixed(4)}</span>
            </div>
            <div class="result-sub-row">
                <span class="result-sub-label">Вартість розроблення (без ПДВ):</span>
                <span class="result-value real">${formatCurrency(finalDocCost)}</span>
            </div>
            <div style="margin-top: 10px; padding: 10px 12px; background: var(--drawing-bg); border: 1px solid var(--drawing-line); border-radius: var(--radius-sm); color: var(--drawing-text); font-size: 12px; line-height: 1.4;">
                <strong>Зверніть увагу:</strong> Відповідно до Настанови, вартість розроблення генерального плану визначається за Таблицею 5-3 на основі чисельності населення без окремого розрахунку вартості містобудівної та землевпорядної частини.
            </div>
        `;

    } else if (docType === "localDetailedPlan") {
        const area = getInputValue("dp_area", 0);

        // містобудівна складова
        const resArea = calculateBasePrice(area, TARIFFS.localDetailedArea, "Площа території ДПТ", "га");
        const baseMist = resArea.basePrice;
        if (resArea.warning) {
            hasAlert = true;
            alertText = "Містобудівна частина: " + resArea.warningMsg;
            warningFieldId = "dp_area";
        }

        // Sliders
        const scaleK = getSliderValue("dp_scale_k");
        const typeK = getSliderValue("dp_type_k");
        const f_mil = getSliderValue("dp_f_mil");
        const f_resort = getSliderValue("dp_f_resort");
        const mistGenCoefs = getComplicatingFactors("dp_mist_gen_coefs");

        const K_mist = combineCoefficients([
            { value: scaleK, mustMultiply: true },
            { value: typeK, mustMultiply: true },
            { value: f_mil, mustMultiply: false },
            { value: f_resort, mustMultiply: true },
            ...mistGenCoefs
        ]);
        mistCost = baseMist * K_mist * globalKzag * globalKdir;

        // землевпорядна складова
        const resLand = calculateBasePrice(area, TARIFFS.localDetailedLandArea, "Площа території ДПТ", "га");
        const baseLand = resLand.basePrice;
        if (resLand.warning) {
            hasAlert = true;
            alertText += (alertText ? "<br>" : "") + "Землевпорядна частина: " + resLand.warningMsg;
            warningFieldId = "dp_area";
        }

        // Read new land sliders for data format, plots, and zones
        const f_data = getSliderValue("dp_f_data");
        const f_plots = getSliderValue("dp_f_plots");
        const f_zones = getSliderValue("dp_f_zones");
        const landGenCoefs = getComplicatingFactors("dp_land_gen_coefs");

        const K_land = combineCoefficients([
            { value: f_data, mustMultiply: false },
            { value: f_plots, mustMultiply: false },
            { value: f_zones, mustMultiply: false },
            ...landGenCoefs
        ]);
        landCost = baseLand * K_land * kzagLand * globalKdir;

        finalDocCost = mistCost + landCost;

        formulaData = {
            area, baseMist, K_mist, globalKzag, globalKdir, mistCost,
            baseLand, K_land, kzagLand, landCost, finalDocCost
        };

        html = `
            <div class="result-sub-row" style="font-weight:600; color:var(--real-text);">
                <span>1. Містобудівна складова (ДПТ):</span>
                <span class="result-value real">${formatCurrency(mistCost)}</span>
            </div>
            <div class="result-sub-row" style="padding-left:15px; font-size:11.5px;">
                <span>• Базова містобудівна:</span>
                <span>${formatCurrency(baseMist)}</span>
            </div>
            <div class="result-sub-row" style="padding-left:15px; font-size:11.5px;">
                <span>• Коефіцієнт містобудівний (К):</span>
                <span>${K_mist.toFixed(4)}</span>
            </div>

            <div class="result-sub-row" style="font-weight:600; color:var(--drawing-text); margin-top:5px;">
                <span>2. Землевпорядна складова (ДПТ):</span>
                <span class="result-value drawing">${formatCurrency(landCost)}</span>
            </div>
            <div class="result-sub-row" style="padding-left:15px; font-size:11.5px;">
                <span>• Базова землевпорядна:</span>
                <span>${formatCurrency(baseLand)}</span>
            </div>
            <div class="result-sub-row" style="padding-left:15px; font-size:11.5px;">
                <span>• Коефіцієнт землевпорядний (К):</span>
                <span>${K_land.toFixed(4)}</span>
            </div>
        `;
    }

    // Display Alert Warning
    const alertBox = document.getElementById("alertBox");
    if (alertBox) {
        if (hasAlert) {
            alertBox.style.display = "block";
            alertBox.innerHTML = linkifyReferences(alertText);
        } else {
            alertBox.style.display = "none";
        }
    }

    // Expertise calculation
    const costThousand = finalDocCost / 1000.0;
    let exp = { cost: 0, percent: 0 };

    let needsExpertise = true;
    if (docType === "localGeneralPlan") {
        needsExpertise = document.getElementById("gp_use_expertise") ? document.getElementById("gp_use_expertise").checked : true;
    } else if (docType === "localDetailedPlan") {
        needsExpertise = document.getElementById("dp_use_expertise") ? document.getElementById("dp_use_expertise").checked : true;
    }

    if (needsExpertise) {
        exp = calculateExpertise(costThousand);
    }

    // VAT calculation
    let vatSum = 0;
    let totalWithVat = finalDocCost + exp.cost;
    if (useVat) {
        vatSum = (finalDocCost + exp.cost) * 0.20;
        totalWithVat = finalDocCost + exp.cost + vatSum;
    }

    formulaData.needsExpertise = needsExpertise;
    formulaData.expCost = exp.cost;
    formulaData.expPercent = exp.percent;
    formulaData.useVat = useVat;
    formulaData.vatSum = vatSum;
    formulaData.totalWithVat = totalWithVat;

    updateFormulaBox(docType, formulaData);

    // Detailed results rendering
    if (needsExpertise) {
        html += `
            <div class="result-sub-row" style="font-weight: 600;">
                <span class="result-sub-label">Проведення експертизи:</span>
                <span>${formatCurrency(exp.cost)} (${exp.percent.toFixed(2)}%)</span>
            </div>
        `;
    } else {
        html += `
            <div class="result-sub-row" style="font-weight: 600;">
                <span class="result-sub-label">Проведення експертизи:</span>
                <span style="color: var(--text-muted);">не проводиться</span>
            </div>
        `;
    }

    if (useVat) {
        html += `
            <div class="result-sub-row" style="font-weight: 600;">
                <span class="result-sub-label">ПДВ (20%):</span>
                <span>${formatCurrency(vatSum)}</span>
            </div>
        `;
    }

    // Додаємо підсумковий рядок "Всього" у загальну розшифровку результатів
    html += `
        <div class="result-total-row" style="margin-top: 10px; border-top: 1px solid var(--line-strong); padding-top: 10px; font-weight: 700; font-size: 14px; display: flex; justify-content: space-between; align-items: center;">
            <span class="result-sub-label" style="font-weight: 700; color: var(--text);">Всього:</span>
            <span class="result-value real">${formatCurrency(totalWithVat)}</span>
        </div>
    `;

    // Якщо є попередження, додаємо коричневу плашку в кінець розшифровки
    if (hasAlert) {
        html += `
            <div class="alert-warning-box" style="margin-top: 12px; padding: 10px 12px; background-color: var(--drawing-bg); border: 1px solid var(--drawing-line); color: var(--drawing-text); border-radius: var(--radius-sm); font-size: 12.5px; font-weight: 550; line-height: 1.45; display: flex; align-items: flex-start; gap: 8px; box-sizing: border-box; width: 100%;">
                <svg class="icon" style="width: 18px; height: 18px; flex-shrink: 0; stroke: currentColor; stroke-width: 2; fill: none; margin-top: 1px;">
                    <use href="#i-warning"></use>
                </svg>
                <div style="flex: 1;">${alertText}</div>
            </div>
        `;
    }

    // Set grand total at BOTH top and bottom results
    const totalHtml = `Всього: <span class="result-value real result-nowrap">${formatCurrency(totalWithVat)}</span>`;

    resultMain.innerHTML = totalHtml;
    resultMainBottom.innerHTML = totalHtml;

    output.innerHTML = linkifyReferences(html);
    outputBottom.innerHTML = linkifyReferences(html);

    // Додаємо іконку попередження біля показника, який його тригернув
    if (hasAlert && warningFieldId) {
        const warningIconContainer = document.getElementById("warning_" + warningFieldId);
        if (warningIconContainer) {
            warningIconContainer.innerHTML = `
                <span class="warning-tooltip-trigger" data-tooltip="${alertText.replace(/"/g, '&quot;').replace(/<br>/g, ' ')}">
                    <svg class="icon" style="width: 16px; height: 16px; stroke: currentColor; fill: none;">
                        <use href="#i-warning"></use>
                    </svg>
                </span>
            `;
        }
    }

    window.lastCalc = {
        docType: docType,
        docTypeName: activeTab.textContent,
        projectName: document.getElementById("projectName")?.value || "",
        globalKzag: globalKzag,
        kzagLand: kzagLand,
        globalKdir: globalKdir,
        useVat: useVat,
        mistCost: mistCost || finalDocCost,
        landCost: landCost,
        expCost: exp.cost,
        expPercent: exp.percent,
        vatSum: vatSum,
        totalWithVat: totalWithVat,
        alertText: hasAlert ? alertText.replace(/<br>/g, " ") : ""
    };

    updateUrlFromState();
    generatePrintReport();
}

function updateUrlFromState() {
    const params = new URLSearchParams();

    // 1. Active tab
    const activeTab = document.querySelector(".tab-btn.active");
    if (activeTab) {
        params.set("tab", activeTab.getAttribute("data-target"));
    }

    // 2. All inputs with ID
    const inputsWithId = document.querySelectorAll("input[id], select[id]");
    inputsWithId.forEach(el => {
        if (el.type === "checkbox") {
            params.set(el.id, el.checked ? "1" : "0");
        } else {
            params.set(el.id, el.value);
        }
    });

    // 3. Checkboxes in groups without ID
    const checkboxGroups = document.querySelectorAll(".checkbox-group");
    checkboxGroups.forEach(group => {
        const checkboxes = group.querySelectorAll("input[type='checkbox']");
        checkboxes.forEach((cb, idx) => {
            if (cb.checked) {
                params.set(`${group.id}_${idx}`, "1");
            }
        });
    });

    const newUrl = window.location.pathname + "?" + params.toString();
    window.history.replaceState({}, "", newUrl);
}

function restoreStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if (params.toString() === "") return;

    // 1. Active tab
    const tabTarget = params.get("tab");
    if (tabTarget) {
        const tabBtn = document.querySelector(`.tab-btn[data-target="${tabTarget}"]`);
        if (tabBtn) {
            document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
            tabBtn.classList.add("active");

            document.querySelectorAll(".form-section").forEach(s => s.classList.remove("active"));
            const activeSection = document.getElementById(tabTarget);
            if (activeSection) {
                activeSection.classList.add("active");
            }
            updateAutocompletePosition();
        }
    }

    // 2. All inputs with ID
    const inputsWithId = document.querySelectorAll("input[id], select[id]");
    inputsWithId.forEach(el => {
        const val = params.get(el.id);
        if (val !== null) {
            if (el.type === "checkbox") {
                el.checked = val === "1";
            } else {
                el.value = val;
            }
        }
    });

    // 3. Checkboxes in groups without ID
    const checkboxGroups = document.querySelectorAll(".checkbox-group");
    checkboxGroups.forEach(group => {
        const checkboxes = group.querySelectorAll("input[type='checkbox']");
        checkboxes.forEach((cb, idx) => {
            const val = params.get(`${group.id}_${idx}`);
            if (val !== null) {
                cb.checked = val === "1";
            } else {
                cb.checked = false;
            }
        });
    });

    updateSliderLabels();
}

function getSliderText(id) {
    const el = document.getElementById(id);
    if (!el) return "";
    const idx = parseInt(el.value) || 0;
    return SLIDER_MAPS[id]?.[idx]?.label || "";
}

function addActiveFactorsToExcel(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const checkboxes = container.querySelectorAll("input[type='checkbox']:checked");
    checkboxes.forEach(cb => {
        const labelEl = cb.closest("label").querySelector(".checkbox-label");
        if (labelEl) {
            data.push(["Ускладнюючий фактор:", labelEl.textContent.trim()]);
        }
    });
}

function exportToExcel() {
    const calcResult = window.lastCalc;
    if (!calcResult) {
        showToast("Немає даних для збереження");
        return;
    }

    const data = [];

    // Звітний заголовок
    data.push(["Розрахунок вартості містобудівної документації", ""]);
    data.push(["", ""]);

    // Загальна інформація
    if (calcResult.projectName) {
        data.push(["Назва об'єкта / договору:", calcResult.projectName]);
    }
    data.push(["Вид документації:", calcResult.docTypeName]);
    data.push(["", ""]);

    // Глобальні параметри
    data.push(["Глобальні параметри", ""]);
    data.push(["Коефіцієнт Кзаг (містобудівний):", calcResult.globalKzag]);
    if (calcResult.docType === "localComplexPlan" || calcResult.docType === "localDetailedPlan") {
        data.push(["Коефіцієнт Кзаг (землевпорядний):", calcResult.kzagLand]);
    }
    data.push(["Поправочний коефіцієнт Кдир:", calcResult.globalKdir]);
    data.push(["Нарахування ПДВ (20%):", calcResult.useVat ? "Так" : "Ні"]);
    data.push(["", ""]);

    // Вихідні показники для кожної форми
    data.push(["Вхідні параметри об'єкта", ""]);
    const docType = calcResult.docType;

    if (docType === "stateParts") {
        data.push(["Площа території (P), тис. км²:", getInputValue("sp_area", 0)]);
        data.push(["Населення громади:", getSliderText("sp_f_pop")]);
        data.push(["Кількість міських н.п.:", getSliderText("sp_f_urban")]);
        data.push(["Кількість сільських н.п.:", getSliderText("sp_f_rural")]);
        data.push(["Кількість міст з нас. понад 100 тис.:", getSliderText("sp_f_cities100")]);
        data.push(["Військові дії:", getSliderText("sp_f_mil")]);
        data.push(["Статус курорту:", getSliderText("sp_f_resort")]);
        addActiveFactorsToExcel("sp_gen_coefs", data);

    } else if (docType === "regionalRegion") {
        data.push(["Площа території (P), тис. км²:", getInputValue("rr_area", 0)]);
        data.push(["Населення громади:", getSliderText("rr_f_pop")]);
        data.push(["Кількість міських н.п.:", getSliderText("rr_f_urban")]);
        data.push(["Кількість сільських н.п.:", getSliderText("rr_f_rural")]);
        data.push(["Кількість міст з нас. понад 100 тис.:", getSliderText("rr_f_cities100")]);
        data.push(["Галузі промисловості:", getSliderText("rr_f_ind")]);
        data.push(["Площа лісогосподарських земель:", getSliderText("rr_f_forest")]);
        data.push(["Військові дії:", getSliderText("rr_f_mil")]);
        data.push(["Статус курорту:", getSliderText("rr_f_resort")]);
        addActiveFactorsToExcel("rr_gen_coefs", data);

    } else if (docType === "regionalDistrict") {
        data.push(["Площа території (P), тис. км²:", getInputValue("rd_area", 0)]);
        data.push(["Населення громади:", getSliderText("rd_f_pop")]);
        data.push(["Кількість міських н.п.:", getSliderText("rd_f_urban")]);
        data.push(["Кількість сільських н.п.:", getSliderText("rd_f_rural")]);
        data.push(["Галузі промисловості:", getSliderText("rd_f_ind")]);
        data.push(["Площа лісогосподарських земель:", getSliderText("rd_f_forest")]);
        data.push(["Військові дії:", getSliderText("rd_f_mil")]);
        data.push(["Статус курорту:", getSliderText("rd_f_resort")]);
        addActiveFactorsToExcel("rd_gen_coefs", data);

    } else if (docType === "localComplexPlan") {
        data.push(["Площа території громади, тис. км²:", getInputValue("cp_area", 0)]);
        data.push(["Населення адмінцентру, тис. осіб:", getInputValue("cp_pop_center", 0)]);
        data.push(["Населення інших н.п., тис. осіб:", getInputValue("cp_pop_other", 0)]);
        data.push(["Сумарне населення всієї громади, тис. осіб:", getInputValue("cp_pop_total", 0)]);
        data.push(["Населення громади (діапазон):", getSliderText("cp_f_pop")]);
        data.push(["Кількість міських н.п.:", getSliderText("cp_f_urban")]);
        data.push(["Кількість сільських н.п.:", getSliderText("cp_f_rural")]);
        data.push(["Галузі промисловості:", getSliderText("cp_f_ind")]);
        data.push(["Користувачі (землевпоряд.):", getSliderText("cp_f_users")]);
        data.push(["Всі 9 категорій земель присутні:", document.getElementById("cp_f_categories")?.checked ? "Так (К=1.1)" : "Ні"]);
        data.push(["Військові дії:", getSliderText("cp_f_mil")]);
        data.push(["Статус курорту:", getSliderText("cp_f_resort")]);
        addActiveFactorsToExcel("cp_gen_coefs", data);
        addActiveFactorsToExcel("cp_land_coefs", data);

    } else if (docType === "localGeneralPlan") {
        data.push(["Населення НП (Р), тис. осіб:", getInputValue("gp_pop", 0)]);
        data.push(["Тип населеного пункту:", getSliderText("gp_city_k")]);
        data.push(["Військові дії:", getSliderText("gp_f_mil")]);
        data.push(["Статус курорту:", getSliderText("gp_f_resort")]);
        data.push(["Проводити експертизу:", document.getElementById("gp_use_expertise")?.checked ? "Так" : "Ні"]);
        addActiveFactorsToExcel("gp_gen_coefs", data);

    } else if (docType === "localDetailedPlan") {
        data.push(["Площа території ДПТ, га:", getInputValue("dp_area", 0)]);
        data.push(["Масштаб графічних матеріалів:", getSliderText("dp_scale_k")]);
        data.push(["Тип території:", getSliderText("dp_type_k")]);
        data.push(["Військові дії:", getSliderText("dp_f_mil")]);
        data.push(["Статус курорту:", getSliderText("dp_f_resort")]);
        data.push(["Формування нових ділянок:", getSliderText("dp_f_plots")]);
        data.push(["Кількість функціональних зон:", getSliderText("dp_f_zones")]);
        data.push(["Формат вихідних даних:", getSliderText("dp_f_data")]);
        data.push(["Проводити експертизу:", document.getElementById("dp_use_expertise")?.checked ? "Так" : "Ні"]);
        addActiveFactorsToExcel("dp_mist_gen_coefs", data);
        addActiveFactorsToExcel("dp_land_gen_coefs", data);
    }
    data.push(["", ""]);

    // Результати розрахунків
    data.push(["Підсумок розрахунку вартості (грн)", ""]);
    if (calcResult.landCost > 0) {
        data.push(["Містобудівна складова:", calcResult.mistCost]);
        data.push(["Землевпорядна складова:", calcResult.landCost]);
    }

    // Сума проектування без експертизи та ПДВ
    data.push(["Вартість розроблення документації (без ПДВ):", calcResult.mistCost + calcResult.landCost]);

    data.push(["Проведення експертизи:", calcResult.expCost > 0 ? calcResult.expCost : "не проводиться"]);
    if (calcResult.useVat) {
        data.push(["ПДВ (20%):", calcResult.vatSum]);
    }
    data.push(["ВСЬОГО:", calcResult.totalWithVat]);

    if (calcResult.alertText) {
        data.push(["", ""]);
        data.push(["ПОПЕРЕДЖЕННЯ:", calcResult.alertText]);
    }

    try {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);

        ws['!cols'] = [
            { wch: 45 },
            { wch: 45 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Кошторис");

        let rawName = calcResult.projectName || calcResult.docTypeName;
        let safeName = rawName.replace(/[/\\?%*:|"<>\s]/g, "_");
        let fileName = `${safeName}_кошторис.xlsx`;

        XLSX.writeFile(wb, fileName);
        showToast("Таблицю успішно збережено!");
    } catch (err) {
        console.error(err);
        showToast("Помилка генерації Excel");
    }
}

function getActiveFactorsHTML(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return "";
    let rows = "";
    const checkboxes = container.querySelectorAll("input[type='checkbox']:checked");
    checkboxes.forEach(cb => {
        const labelEl = cb.closest("label").querySelector(".checkbox-label");
        if (labelEl) {
            rows += `<tr><td>Ускладнюючий фактор: ${labelEl.textContent.trim()}</td><td style="text-align: right;">так</td></tr>`;
        }
    });
    return rows;
}

function generatePrintReport() {
    const calcResult = window.lastCalc;
    const reportEl = document.getElementById("printReport");
    if (!reportEl || !calcResult) return;

    const today = new Date().toLocaleDateString("uk-UA");
    let html = `
        <div class="print-header">
            <h2>ЗВІТ ПРО РОЗРАХУНОК ВАРТОСТІ</h2>
            <div class="print-meta-row">
                <span><b>Дата розрахунку:</b> ${today}</span>
            </div>
            ${calcResult.projectName ? `<div class="print-meta-row"><b>Назва об'єкта / договору:</b> ${calcResult.projectName}</div>` : ""}
            <div class="print-meta-row"><b>Вид документації:</b> ${calcResult.docTypeName}</div>
        </div>
        
        <div class="print-section">
            <h3>Вхідні параметри та коефіцієнти:</h3>
            <table class="print-table">
                <thead>
                    <tr>
                        <th>Параметр / Ускладнюючий коефіцієнт</th>
                        <th style="text-align: right; width: 320px;">Значення</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Коефіцієнт Кзаг містобудівний (Додаток 7, п. 2)</td>
                        <td style="text-align: right;">${calcResult.globalKzag}</td>
                    </tr>
                    ${(calcResult.docType === "localComplexPlan" || calcResult.docType === "localDetailedPlan") ? `
                    <tr>
                        <td>Коефіцієнт Кзаг землевпорядний (Додаток 7, п. 4)</td>
                        <td style="text-align: right;">${calcResult.kzagLand}</td>
                    </tr>
                    ` : ""}
                    <tr>
                        <td>Поправочний коефіцієнт Кдир</td>
                        <td style="text-align: right;">${calcResult.globalKdir}</td>
                    </tr>
                    <tr>
                        <td>Податок на додану вартість (ПДВ 20%)</td>
                        <td style="text-align: right;">${calcResult.useVat ? "Нараховується" : "Не нараховується"}</td>
                    </tr>
    `;

    const docType = calcResult.docType;
    if (docType === "stateParts") {
        html += `
            <tr><td>Площа території (P), тис. км²</td><td style="text-align: right;">${getInputValue("sp_area", 0)}</td></tr>
            <tr><td>Населення громади</td><td style="text-align: right;">${getSliderText("sp_f_pop")}</td></tr>
            <tr><td>Кількість міських н.п.</td><td style="text-align: right;">${getSliderText("sp_f_urban")}</td></tr>
            <tr><td>Кількість сільських н.п.</td><td style="text-align: right;">${getSliderText("sp_f_rural")}</td></tr>
            <tr><td>Кількість міст з нас. понад 100 тис.</td><td style="text-align: right;">${getSliderText("sp_f_cities100")}</td></tr>
            <tr><td>Військові дії</td><td style="text-align: right;">${getSliderText("sp_f_mil")}</td></tr>
            <tr><td>Статус курорту</td><td style="text-align: right;">${getSliderText("sp_f_resort")}</td></tr>
        `;
        html += getActiveFactorsHTML("sp_gen_coefs");

    } else if (docType === "regionalRegion") {
        html += `
            <tr><td>Площа території (P), тис. км²</td><td style="text-align: right;">${getInputValue("rr_area", 0)}</td></tr>
            <tr><td>Населення громади</td><td style="text-align: right;">${getSliderText("rr_f_pop")}</td></tr>
            <tr><td>Кількість міських н.п.</td><td style="text-align: right;">${getSliderText("rr_f_urban")}</td></tr>
            <tr><td>Кількість сільських н.п.</td><td style="text-align: right;">${getSliderText("rr_f_rural")}</td></tr>
            <tr><td>Кількість міст з нас. понад 100 тис.</td><td style="text-align: right;">${getSliderText("rr_f_cities100")}</td></tr>
            <tr><td>Галузі промисловості</td><td style="text-align: right;">${getSliderText("rr_f_ind")}</td></tr>
            <tr><td>Площа лісогосподарських земель</td><td style="text-align: right;">${getSliderText("rr_f_forest")}</td></tr>
            <tr><td>Військові дії</td><td style="text-align: right;">${getSliderText("rr_f_mil")}</td></tr>
            <tr><td>Статус курорту</td><td style="text-align: right;">${getSliderText("rr_f_resort")}</td></tr>
        `;
        html += getActiveFactorsHTML("rr_gen_coefs");

    } else if (docType === "regionalDistrict") {
        html += `
            <tr><td>Площа території (P), тис. км²</td><td style="text-align: right;">${getInputValue("rd_area", 0)}</td></tr>
            <tr><td>Населення громади</td><td style="text-align: right;">${getSliderText("rd_f_pop")}</td></tr>
            <tr><td>Кількість міських н.п.</td><td style="text-align: right;">${getSliderText("rd_f_urban")}</td></tr>
            <tr><td>Кількість сільських н.п.</td><td style="text-align: right;">${getSliderText("rd_f_rural")}</td></tr>
            <tr><td>Галузі промисловості</td><td style="text-align: right;">${getSliderText("rd_f_ind")}</td></tr>
            <tr><td>Площа лісогосподарських земель</td><td style="text-align: right;">${getSliderText("rd_f_forest")}</td></tr>
            <tr><td>Військові дії</td><td style="text-align: right;">${getSliderText("rd_f_mil")}</td></tr>
            <tr><td>Статус курорту</td><td style="text-align: right;">${getSliderText("rd_f_resort")}</td></tr>
        `;
        html += getActiveFactorsHTML("rd_gen_coefs");

    } else if (docType === "localComplexPlan") {
        html += `
            <tr><td>Площа території громади, тис. км²</td><td style="text-align: right;">${getInputValue("cp_area", 0)}</td></tr>
            <tr><td>Населення громади (Табл. 6-1), тис. осіб</td><td style="text-align: right;">${getInputValue("cp_pop_total", 0)}</td></tr>
            <tr><td>Населення адмінцентру, тис. осіб</td><td style="text-align: right;">${getInputValue("cp_pop_center", 0)}</td></tr>
            <tr><td>Населення інших н.п., тис. осіб</td><td style="text-align: right;">${getInputValue("cp_pop_other", 0)}</td></tr>
            <tr><td>Населення громади (діапазон)</td><td style="text-align: right;">${getSliderText("cp_f_pop")}</td></tr>
            <tr><td>Кількість міських н.п.</td><td style="text-align: right;">${getSliderText("cp_f_urban")}</td></tr>
            <tr><td>Кількість сільських н.п.</td><td style="text-align: right;">${getSliderText("cp_f_rural")}</td></tr>
            <tr><td>Галузі промисловості</td><td style="text-align: right;">${getSliderText("cp_f_ind")}</td></tr>
            <tr><td>Користувачі (землевпоряд.)</td><td style="text-align: right;">${getSliderText("cp_f_users")}</td></tr>
            <tr><td>Всі 9 категорій земель присутні</td><td style="text-align: right;">${document.getElementById("cp_f_categories")?.checked ? "Так (К=1.1)" : "Ні"}</td></tr>
            <tr><td>Військові дії</td><td style="text-align: right;">${getSliderText("cp_f_mil")}</td></tr>
            <tr><td>Статус курорту</td><td style="text-align: right;">${getSliderText("cp_f_resort")}</td></tr>
        `;
        html += getActiveFactorsHTML("cp_gen_coefs");
        html += getActiveFactorsHTML("cp_land_coefs");

    } else if (docType === "localGeneralPlan") {
        html += `
            <tr><td>Населення НП (Р), тис. осіб</td><td style="text-align: right;">${getInputValue("gp_pop", 0)}</td></tr>
            <tr><td>Тип населеного пункту</td><td style="text-align: right;">${getSliderText("gp_city_k")}</td></tr>
            <tr><td>Військові дії</td><td style="text-align: right;">${getSliderText("gp_f_mil")}</td></tr>
            <tr><td>Статус курорту</td><td style="text-align: right;">${getSliderText("gp_f_resort")}</td></tr>
            <tr><td>Проводити експертизу</td><td style="text-align: right;">${document.getElementById("gp_use_expertise")?.checked ? "Так" : "Ні"}</td></tr>
        `;
        html += getActiveFactorsHTML("gp_gen_coefs");

    } else if (docType === "localDetailedPlan") {
        html += `
            <tr><td>Площа території ДПТ, га</td><td style="text-align: right;">${getInputValue("dp_area", 0)}</td></tr>
            <tr><td>Масштаб графічних матеріалів</td><td style="text-align: right;">${getSliderText("dp_scale_k")}</td></tr>
            <tr><td>Тип території</td><td style="text-align: right;">${getSliderText("dp_type_k")}</td></tr>
            <tr><td>Військові дії</td><td style="text-align: right;">${getSliderText("dp_f_mil")}</td></tr>
            <tr><td>Статус курорту</td><td style="text-align: right;">${getSliderText("dp_f_resort")}</td></tr>
            <tr><td>Формування нових ділянок</td><td style="text-align: right;">${getSliderText("dp_f_plots")}</td></tr>
            <tr><td>Кількість функціональних зон</td><td style="text-align: right;">${getSliderText("dp_f_zones")}</td></tr>
            <tr><td>Формат вихідних даних</td><td style="text-align: right;">${getSliderText("dp_f_data")}</td></tr>
            <tr><td>Проводити експертизу</td><td style="text-align: right;">${document.getElementById("dp_use_expertise")?.checked ? "Так" : "Ні"}</td></tr>
        `;
        html += getActiveFactorsHTML("dp_mist_gen_coefs");
        html += getActiveFactorsHTML("dp_land_gen_coefs");
    }

    html += `
                </tbody>
            </table>
        </div>

        <div class="print-section print-results">
            <h3>Результати розрахунку вартості:</h3>
            <table class="print-table print-total-table">
                <tbody>
    `;

    if (calcResult.landCost > 0) {
        html += `
            <tr><td>Містобудівна складова:</td><td style="text-align: right;">${formatCurrency(calcResult.mistCost)}</td></tr>
            <tr><td>Землевпорядна складова:</td><td style="text-align: right;">${formatCurrency(calcResult.landCost)}</td></tr>
        `;
    }
    html += `
        <tr><td>Вартість розроблення документації (без ПДВ):</td><td style="text-align: right;">${formatCurrency(calcResult.mistCost + calcResult.landCost)}</td></tr>
        <tr><td>Проведення експертизи:</td><td style="text-align: right;">${calcResult.expCost > 0 ? formatCurrency(calcResult.expCost) + ' (' + calcResult.expPercent.toFixed(2) + '%)' : 'не проводиться'}</td></tr>
    `;
    if (calcResult.useVat) {
        html += `
            <tr><td>ПДВ (20%):</td><td style="text-align: right;">${formatCurrency(calcResult.vatSum)}</td></tr>
        `;
    }
    html += `
        <tr class="grand-total"><td><b>ВСЬОГО:</b></td><td style="text-align: right;"><b>${formatCurrency(calcResult.totalWithVat)}</b></td></tr>
                </tbody>
            </table>
        </div>
        
        ${calcResult.alertText ? `
            <div class="print-alert" style="margin-top: 15px; padding: 10px 12px; border: 1.5px solid #000; background: #fff; font-size: 11px; font-weight: bold; line-height: 1.4; display: flex; align-items: flex-start; gap: 8px;">
                <span style="font-size: 14px;">⚠️</span>
                <div><b>УВАГА / Попередження:</b> ${calcResult.alertText}</div>
            </div>
        ` : ""}
        
        <div class="print-footer">
            <p>Калькулятор вартості містобудівної документації розроблено відповідно до Настанови з визначення вартості містобудівної документації Мінрегіону України.</p>
        </div>
    `;

    reportEl.innerHTML = html;
}

// --- GUIDEBOOK (SIDE PANEL WITH ZERO-MD) INTEGRATION ---

function linkifyReferences(html) {
    if (!html) return html;

    // Regex safely matches HTML tags OR reference patterns to avoid altering attribute values:
    // Group 1: HTML tag
    // Group 2: Table number X-Y (e.g. 5-1, 6-3)
    // Group 3, 4, 5: Paragraph (Cyrillic word boundary prefix, paragraph prefix and number, e.g. п. 2.3)
    // Group 6, 7, 8: Section (Cyrillic word boundary prefix, section prefix and roman/digit number, e.g. розділ 2)
    const regex = /(<[^>]+>)|(\b\d+[-–]\d+\b)|(^|[^a-zа-яёіїєґ])(п\.|пункті|пункт[а-я]*|пп\.)\s*(\d+\.\d+)(?![a-zа-яёіїєґ])|(^|[^a-zа-яёіїєґ])(розділ[а-я]*)\s*([IVXLCDMІі\d]+)(?![a-zа-яёіїєґ])/gi;

    return html.replace(regex, function (match, g1, g2, g3, g4, g5, g6, g7, g8) {
        if (g1) {
            // HTML tag - return unchanged
            return g1;
        }
        if (g2) {
            // Table number X-Y (e.g. 5-1)
            const clean = g2.replace('–', '-');
            return `<span class="doc-link" data-target="table-${clean}">${g2}</span>`;
        }
        if (g4 && g5) {
            // Paragraph (e.g. п. 2.3)
            const clean = g5.replace(/\./g, '-');
            return `${g3}${g4} <span class="doc-link" data-target="p-${clean}">${g5}</span>`;
        }
        if (g7 && g8) {
            // Section (e.g. розділ 2, розділі VІ)
            let target = "";
            const val = g8.toUpperCase().trim();
            if (val === 'І' || val === '1') target = 'section-1';
            else if (val === 'ІІ' || val === '2') target = 'section-2';
            else if (val === 'ІІІ' || val === '3') target = 'section-3';
            else if (val === 'IV' || val === '4') target = 'section-4';
            else if (val === 'V' || val === '5') target = 'section-5';
            else if (val === 'VІ' || val === 'VI' || val === '6') target = 'section-6';

            if (target) {
                return `${g6}${g7} <span class="doc-link" data-target="${target}">${g8}</span>`;
            }
            return match;
        }
        return match;
    });
}

function openGuidebookTo(targetId) {
    const wasOpen = document.body.classList.contains('panel-open');
    document.body.classList.add('panel-open');

    // Reset horizontal scroll inside the side-panel-body container
    const panelBody = document.querySelector('.side-panel-body');
    if (panelBody) {
        panelBody.scrollLeft = 0;
        if (targetId === 'top') {
            panelBody.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    const zeroMd = document.getElementById('zeroMdDoc');
    if (!zeroMd) return;

    if (targetId === 'top') {
        const doReset = () => {
            const shadow = zeroMd.shadowRoot;
            if (!shadow) return;
            shadow.querySelectorAll('.highlight-target').forEach(el => {
                el.classList.remove('highlight-target');
            });
            const mdBody = shadow.querySelector('.markdown-body');
            if (mdBody) {
                mdBody.scrollLeft = 0;
            }
            shadow.querySelectorAll('table').forEach(tbl => {
                tbl.scrollLeft = 0;
            });
        };
        if (zeroMd.shadowRoot && zeroMd.shadowRoot.querySelector('.markdown-body')) {
            if (!wasOpen) {
                setTimeout(doReset, 350);
            } else {
                doReset();
            }
        } else {
            zeroMd.addEventListener('zero-md-rendered', () => {
                if (!wasOpen) {
                    setTimeout(doReset, 350);
                } else {
                    doReset();
                }
            }, { once: true });
        }
        return;
    }

    const doScroll = () => {
        const shadow = zeroMd.shadowRoot;
        if (!shadow) return;

        // Reset horizontal scroll inside shadow DOM markdown container and tables
        const mdBody = shadow.querySelector('.markdown-body');
        if (mdBody) {
            mdBody.scrollLeft = 0;
        }
        shadow.querySelectorAll('table').forEach(tbl => {
            tbl.scrollLeft = 0;
        });

        // Find anchor by id or name inside zero-md shadowRoot
        const target = shadow.querySelector(`#${targetId}`) || shadow.querySelector(`a[name="${targetId}"]`) || shadow.querySelector(`[id="${targetId}"]`);
        if (target) {
            // Clear existing highlights immediately
            shadow.querySelectorAll('.highlight-target').forEach(el => {
                el.classList.remove('highlight-target');
            });

            // Perform scrolling
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Highlight sibling element if the target is an anchor tag
            let elementToHighlight = target;
            if (target.tagName === 'A' && target.nextElementSibling) {
                elementToHighlight = target.nextElementSibling;
            }

            // Wait for smooth scrolling to complete before flashing the highlight
            setTimeout(() => {
                // Ensure no other highlights are active
                shadow.querySelectorAll('.highlight-target').forEach(el => {
                    el.classList.remove('highlight-target');
                });
                // Force reflow and add class
                void elementToHighlight.offsetWidth;
                elementToHighlight.classList.add('highlight-target');
            }, 600);
        } else {
            console.warn("Could not find anchor inside zero-md shadowRoot:", targetId);
        }
    };

    // Check if zero-md content is already rendered
    if (zeroMd.shadowRoot && zeroMd.shadowRoot.querySelector('.markdown-body')) {
        if (!wasOpen) {
            setTimeout(doScroll, 350);
        } else {
            doScroll();
        }
    } else {
        // Wait for rendering event
        zeroMd.addEventListener('zero-md-rendered', () => {
            if (!wasOpen) {
                setTimeout(doScroll, 350);
            } else {
                setTimeout(doScroll, 150);
            }
        }, { once: true });
    }
}

function linkifyStaticElements() {
    const selectors = [
        '.form-group-title',
        'label',
        '.unit-label',
        '.checkbox-label',
        '.sub',
        '.group-title-row',
        '.info-note'
    ];
    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            if (/(Таблиц[іея]|Таблиця|Табл\.)(\s+)(\d+[-–]\d+)/gi.test(el.innerHTML)) {
                if (!el.querySelector('.doc-link')) {
                    el.innerHTML = linkifyReferences(el.innerHTML);
                }
            }
        });
    });
}

function initGuidebook() {
    const docBtn = document.getElementById("docBtn");
    const closePanelBtn = document.getElementById("closePanelBtn");
    const resizer = document.getElementById("sidePanelResizer");
    const sidePanel = document.getElementById("sidePanel");

    // Linkify static labels and headers on page load
    linkifyStaticElements();

    // Load saved width from localStorage
    const savedWidth = localStorage.getItem('side-panel-width');
    if (savedWidth) {
        document.documentElement.style.setProperty('--side-panel-width', savedWidth + 'px');
    }

    // Resizing logic
    if (resizer && sidePanel) {
        resizer.addEventListener('mousedown', function (e) {
            e.preventDefault();

            const startX = e.clientX;
            const startWidth = sidePanel.getBoundingClientRect().width;

            document.body.classList.add('is-resizing');

            function onMouseMove(e) {
                const currentX = e.clientX;
                const deltaX = startX - currentX;
                let newWidth = startWidth + deltaX;

                // Boundaries
                const minWidth = 320;
                const maxWidth = window.innerWidth - 320; // Keep at least 320px for calculator

                if (newWidth < minWidth) newWidth = minWidth;
                if (newWidth > maxWidth) newWidth = maxWidth;

                document.documentElement.style.setProperty('--side-panel-width', newWidth + 'px');
                localStorage.setItem('side-panel-width', newWidth);
            }

            function onMouseUp() {
                document.body.classList.remove('is-resizing');
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    if (docBtn) {
        docBtn.addEventListener('click', () => {
            const isOpen = document.body.classList.toggle('panel-open');
            if (isOpen) {
                openGuidebookTo('top');
            }
        });
    }

    if (closePanelBtn) {
        closePanelBtn.addEventListener('click', () => {
            document.body.classList.remove('panel-open');
        });
    }

    // Global delegation for clicks on elements with the .doc-link class
    document.addEventListener('click', function (e) {
        const docLink = e.target.closest('.doc-link');
        if (docLink) {
            e.preventDefault();
            const targetId = docLink.getAttribute('data-target');
            if (targetId) {
                openGuidebookTo(targetId);
            }
        }
    });
}

// --- AUTOCOMPLETE ADMIN UNITS INTEGRATION ---

let autocompleteData = {
    loaded: false,
    loading: false,
    searchIndex: []
};
let loadingPromise = null;

async function fetchAutocompleteData() {
    if (autocompleteData.loaded) return;
    if (autocompleteData.loading) {
        await loadingPromise;
        return;
    }

    autocompleteData.loading = true;
    loadingPromise = (async () => {
        const spinner = document.getElementById("adminSearchSpinner");
        if (spinner) spinner.style.display = "block";

        let areas = [];
        let regions = [];
        let communities = [];
        let wikidataCities = [];
        let loadedSuccessfully = false;

        try {
            console.log("Loading admin units from local admin_units.json database...");
            const resLocal = await fetch("admin_units.json");
            if (!resLocal.ok) throw new Error(`HTTP ${resLocal.status} on local JSON`);
            const localData = await resLocal.json();

            areas = localData.areas || [];
            regions = localData.regions || [];
            communities = localData.communities || [];

            loadedSuccessfully = true;
            console.log("Admin units database loaded successfully.");
        } catch (localErr) {
            console.error("Failed to load local admin units database: ", localErr);
            showToast("Помилка завантаження даних для автозаповнення");
        }

        if (loadedSuccessfully) {
            // Count actual communities and sum properties per area and region
            const communitiesCountMap = {};
            const communitiesSquareMap = {};
            const communitiesPopulationMap = {};
            const communitiesRuralMap = {};
            const communitiesUrbanMap = {};

            const regionSquareMap = {};
            const regionPopulationMap = {};
            const regionRuralMap = {};
            const regionUrbanMap = {};

            communities.forEach(comm => {
                const ruralVal = parseInt(comm.rural_villages_count) || 0;
                const urbanVal = parseInt(comm.urban_villages_count) || 0;

                // For Areas
                if (comm.area_id) {
                    communitiesCountMap[comm.area_id] = (communitiesCountMap[comm.area_id] || 0) + 1;

                    const sq = parseFloat(comm.square) || 0;
                    communitiesSquareMap[comm.area_id] = (communitiesSquareMap[comm.area_id] || 0) + sq;

                    const pop = parseFloat(comm.population) || 0;
                    communitiesPopulationMap[comm.area_id] = (communitiesPopulationMap[comm.area_id] || 0) + pop;

                    communitiesRuralMap[comm.area_id] = (communitiesRuralMap[comm.area_id] || 0) + ruralVal;
                    communitiesUrbanMap[comm.area_id] = (communitiesUrbanMap[comm.area_id] || 0) + urbanVal;
                }

                // For Regions (Districts)
                if (comm.region_id) {
                    const sq = parseFloat(comm.square) || 0;
                    regionSquareMap[comm.region_id] = (regionSquareMap[comm.region_id] || 0) + sq;

                    const pop = parseFloat(comm.population) || 0;
                    regionPopulationMap[comm.region_id] = (regionPopulationMap[comm.region_id] || 0) + pop;

                    regionRuralMap[comm.region_id] = (regionRuralMap[comm.region_id] || 0) + ruralVal;
                    regionUrbanMap[comm.region_id] = (regionUrbanMap[comm.region_id] || 0) + urbanVal;
                }
            });

            // Build map of areas for quick lookup by ID
            const areasMap = {};
            areas.forEach(a => { areasMap[a.id] = a.title; });

            // Build combined search index
            const index = [];

            areas.forEach(area => {
                // Fallback for area stats if database contains placeholder values (e.g. city Kyiv with square=1, population=1)
                if (!area.square || area.square <= 1.0) {
                    area.square = communitiesSquareMap[area.id] || area.square || 0;
                }
                if (!area.population || area.population <= 1) {
                    area.population = communitiesPopulationMap[area.id] || area.population || 0;
                }

                // Store dynamic community count
                area.actual_community_count = communitiesCountMap[area.id] || 0;

                // Store dynamic village counts
                area.rural_villages_count = communitiesRuralMap[area.id] || 0;
                area.urban_villages_count = communitiesUrbanMap[area.id] || 0;

                const isKyivCity = area.title === "Київ" || area.katottg === "UA80000000000093317";
                index.push({
                    type: isKyivCity ? "wikidata_city" : "area",
                    id: area.id,
                    title: isKyivCity ? "Київ" : area.title,
                    subtitle: isKyivCity ? "Населений пункт" : "Область",
                    searchString: area.title.toLowerCase(),
                    rawData: isKyivCity ? {
                        ...area,
                        square: 839.0,
                        population: 2950000,
                        type: "місто"
                    } : area
                });
            });

            regions.forEach(region => {
                // Fallback for region square if it is null/0
                const rawSquare = parseFloat(region.square);
                if (isNaN(rawSquare) || rawSquare <= 0) {
                    region.square = regionSquareMap[region.id] || 0;
                }

                // Fallback for region population if it is null/0
                const rawPop = parseFloat(region.population);
                if (isNaN(rawPop) || rawPop <= 0) {
                    region.population = regionPopulationMap[region.id] || 0;
                }

                // Store dynamic village counts
                region.rural_villages_count = regionRuralMap[region.id] || 0;
                region.urban_villages_count = regionUrbanMap[region.id] || 0;

                const areaName = areasMap[region.area_id] || "";
                index.push({
                    type: "region",
                    id: region.id,
                    title: region.title,
                    subtitle: areaName ? `${areaName} область` : "Район",
                    searchString: `${region.title} ${areaName}`.toLowerCase(),
                    rawData: region
                });
            });

            communities.forEach(comm => {
                const subtitleParts = [];
                if (comm.region_name) subtitleParts.push(`${comm.region_name} район`);
                if (comm.area_name) subtitleParts.push(`${comm.area_name} область`);

                index.push({
                    type: "community",
                    id: comm.id,
                    title: comm.title,
                    subtitle: subtitleParts.join(", "),
                    searchString: `${comm.title} ${comm.region_name || ''} ${comm.area_name || ''}`.toLowerCase(),
                    rawData: comm
                });
            });

            // Add settlements from admin_units.json as wikidata_city
            const seenCities = new Set();
            communities.forEach(comm => {
                const setts = comm.settlements || [];
                setts.forEach(sett => {
                    const name = sett.title;
                    if (!name) return;

                    // Create a unique key for duplicate check to allow same settlement name in different communities
                    const uniqueKey = `${name.toLowerCase()}_${comm.title.toLowerCase()}`;
                    if (seenCities.has(uniqueKey)) return;
                    seenCities.add(uniqueKey);

                    const subtitleParts = [];
                    if (sett.type) subtitleParts.push(sett.type);
                    subtitleParts.push(comm.title);
                    if (comm.region_name) subtitleParts.push(`${comm.region_name} район`);
                    if (comm.area_name) subtitleParts.push(`${comm.area_name} область`);

                    index.push({
                        type: "wikidata_city",
                        id: sett.katottg || name,
                        title: name,
                        subtitle: subtitleParts.join(", "),
                        searchString: `${name} ${sett.type || ''} ${comm.title} ${comm.region_name || ''} ${comm.area_name || ''}`.toLowerCase(),
                        rawData: {
                            title: name,
                            population: parseFloat(sett.population) || 0,
                            square: parseFloat(sett.square) || 0,
                            katottg: sett.katottg,
                            type: sett.type
                        }
                    });
                });
            });

            autocompleteData.searchIndex = index;
            autocompleteData.loaded = true;
            console.log(`Autocomplete index loaded successfully with ${index.length} items.`);
        }

        autocompleteData.loading = false;
        if (spinner) spinner.style.display = "none";
    })();
    await loadingPromise;
}


let currentSuggestions = [];
let activeSuggestionIndex = -1;

function initAutocomplete() {
    const input = document.getElementById("adminSearch");
    const suggestionsBox = document.getElementById("adminSuggestions");
    const applyBtn = document.getElementById("adminModalApplyBtn");
    const cancelBtn = document.getElementById("adminModalCancelBtn");
    const clearBtn = document.getElementById("adminSearchClearBtn");
    const modal = document.getElementById("adminModal");

    if (!input || !suggestionsBox) return;

    const triggerSearch = () => {
        const query = input.value.trim().toLowerCase();

        const matches = autocompleteData.searchIndex.filter(item => {
            if (query.length > 0) {
                if (!item.searchString.includes(query)) return false;
            }
            return true;
        });

        // Limit to 15 suggestions
        const limited = matches.slice(0, 15);
        renderSuggestions(limited);
    };

    // Load data on focus and show suggestions
    input.addEventListener("focus", async () => {
        await fetchAutocompleteData();
        triggerSearch();
    });

    // Clear button functionality
    const updateClearBtnVisibility = () => {
        if (clearBtn) {
            clearBtn.style.display = input.value.length > 0 ? "flex" : "none";
        }
    };
    input.addEventListener("input", updateClearBtnVisibility);

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            input.value = "";
            clearBtn.style.display = "none";
            suggestionsBox.style.display = "none";
            input.focus();
        });
    }

    // Autocomplete search logic
    input.addEventListener("input", () => {
        triggerSearch();
    });

    // Keyboard navigation in suggestions list
    input.addEventListener("keydown", (e) => {
        if (suggestionsBox.style.display === "none") return;

        const itemsElements = suggestionsBox.querySelectorAll(".suggestion-item");
        if (itemsElements.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeSuggestionIndex++;
            if (activeSuggestionIndex >= itemsElements.length) {
                activeSuggestionIndex = 0;
            }
            updateActiveSuggestion(itemsElements);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeSuggestionIndex--;
            if (activeSuggestionIndex < 0) {
                activeSuggestionIndex = itemsElements.length - 1;
            }
            updateActiveSuggestion(itemsElements);
        } else if (e.key === "Enter") {
            if (activeSuggestionIndex >= 0 && activeSuggestionIndex < currentSuggestions.length) {
                e.preventDefault();
                e.stopPropagation();
                const selected = currentSuggestions[activeSuggestionIndex];
                selectSuggestion(selected);
            }
        } else if (e.key === "Escape") {
            e.preventDefault();
            suggestionsBox.style.display = "none";
        }
    });

    function updateActiveSuggestion(elements) {
        elements.forEach((el, idx) => {
            if (idx === activeSuggestionIndex) {
                el.classList.add("keyboard-active");
                el.scrollIntoView({ block: "nearest" });
            } else {
                el.classList.remove("keyboard-active");
            }
        });
    }

    // Close suggestions dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (e.target !== input && !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.display = "none";
        }
    });

    // Handle Cancel button click
    if (cancelBtn && modal) {
        cancelBtn.addEventListener("click", () => {
            modal.style.display = "none";
            window.pendingAdminUnit = null;
        });
    }

    // Handle Apply button click
    if (applyBtn && modal) {
        applyBtn.addEventListener("click", () => {
            if (window.pendingAdminUnit) {
                applyAdminUnit(window.pendingAdminUnit);
                window.pendingAdminUnit = null;
            }
            modal.style.display = "none";
        });
    }

    // Handle Enter, Escape, and Left/Right keys for the confirmation modal
    document.addEventListener("keydown", (e) => {
        if (modal && modal.style.display === "flex") {
            if (e.key === "Enter") {
                e.preventDefault();
                if (document.activeElement === cancelBtn) {
                    cancelBtn.click();
                } else {
                    applyBtn.click();
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                cancelBtn.click();
            } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                if (document.activeElement === applyBtn) {
                    cancelBtn.focus();
                } else {
                    applyBtn.focus();
                }
            }
        }
    });
}

function updateAutocompletePosition() {
    const activeTabBtn = document.querySelector(".tab-btn.active");
    const targetId = activeTabBtn ? activeTabBtn.getAttribute("data-target") : null;
    const isSupported = ["regionalRegion", "regionalDistrict", "localComplexPlan", "localGeneralPlan"].includes(targetId);

    const wrapper = document.getElementById("adminSearchWrapper");
    if (!wrapper) return;

    const input = document.getElementById("adminSearch");

    if (isSupported) {
        if (input) {
            if (targetId === "regionalRegion") {
                input.placeholder = "Введіть назву області";
            } else if (targetId === "regionalDistrict") {
                input.placeholder = "Введіть назву району";
            } else if (targetId === "localComplexPlan") {
                input.placeholder = "Введіть назву громади";
            } else if (targetId === "localGeneralPlan") {
                input.placeholder = "Введіть назву населеного пункту";
            }
        }

        const activeSection = document.getElementById(targetId);
        const placeholder = activeSection ? activeSection.querySelector(".admin-search-container-target") : null;
        if (placeholder) {
            placeholder.appendChild(wrapper);
            wrapper.style.display = "block";
        } else {
            wrapper.style.display = "none";
        }
    } else {
        wrapper.style.display = "none";
    }

    // Hide suggestions dropdown and update clear button visibility
    const suggestionsBox = document.getElementById("adminSuggestions");
    if (suggestionsBox) suggestionsBox.style.display = "none";
    const clearBtn = document.getElementById("adminSearchClearBtn");
    if (clearBtn) {
        clearBtn.style.display = input && input.value.length > 0 ? "flex" : "none";
    }
}

function renderSuggestions(items) {
    const suggestionsBox = document.getElementById("adminSuggestions");
    if (!suggestionsBox) return;

    currentSuggestions = items;
    activeSuggestionIndex = -1;
    suggestionsBox.scrollTop = 0;

    if (items.length === 0) {
        suggestionsBox.innerHTML = `
            <div style="padding: 12px 14px; font-size: 12.5px; color: var(--muted); text-align: center;">
                Нічого не знайдено
            </div>
        `;
        suggestionsBox.style.display = "block";
        return;
    }

    let html = "";
    items.forEach((item, index) => {
        let tagClass = "";
        let tagName = "";
        if (item.type === "area") {
            tagClass = "tag-area";
            tagName = "Область";
        } else if (item.type === "region") {
            tagClass = "tag-region";
            tagName = "Район";
        } else if (item.type === "community") {
            tagClass = "tag-community";
            tagName = "Громада";
        } else if (item.type === "wikidata_city") {
            const rawType = (item.rawData && item.rawData.type) ? item.rawData.type.toLowerCase() : "місто";
            if (rawType.includes("селище") || rawType === "смт") {
                tagClass = "tag-settlement";
                tagName = "Селище";
            } else if (rawType.includes("село")) {
                tagClass = "tag-village";
                tagName = "Село";
            } else if (rawType.includes("район в місті")) {
                tagClass = "tag-city-district";
                tagName = "Район у місті";
            } else {
                tagClass = "tag-city";
                tagName = "Місто";
            }
        }

        html += `
            <div class="suggestion-item" data-idx="${index}">
                <div class="suggestion-title">${item.title}</div>
                <div class="suggestion-subtitle">${item.subtitle}</div>
                <span class="suggestion-tag ${tagClass}">${tagName}</span>
            </div>
        `;
    });

    suggestionsBox.innerHTML = html;
    suggestionsBox.style.display = "block";

    // Click events
    const elements = suggestionsBox.querySelectorAll(".suggestion-item");
    elements.forEach(el => {
        el.addEventListener("click", () => {
            const idx = parseInt(el.getAttribute("data-idx"));
            const selected = items[idx];
            if (selected) {
                selectSuggestion(selected);
            }
        });
    });
}

function selectSuggestion(selected) {
    const suggestionsBox = document.getElementById("adminSuggestions");
    if (suggestionsBox) suggestionsBox.style.display = "none";
    const input = document.getElementById("adminSearch");
    if (input) input.value = selected.title;
    const clearBtn = document.getElementById("adminSearchClearBtn");
    if (clearBtn) clearBtn.style.display = "flex";
    window.pendingAdminUnit = selected;
    prepareAndShowConfirmation(selected);
}

function prepareAndShowConfirmation(item) {
    const details = {};

    if (item.type === "area") {
        const areaVal = item.rawData.square ? item.rawData.square / 1000 : 0;
        details["Вид документації"] = "Схема планування території області";
        details["Площа області"] = areaVal > 0 ? `${areaVal.toFixed(2)} тис. км²` : "Дані відсутні";
        details["Чисельність населення"] = item.rawData.population ? `${item.rawData.population.toLocaleString()} осіб` : "Дані відсутні";
        if (item.rawData.actual_community_count) {
            details["Кількість громад в області"] = item.rawData.actual_community_count;
        } else if (item.rawData.local_community_count) {
            details["Кількість громад в області"] = item.rawData.local_community_count;
        }
        details["Кількість міських н.п. в області"] = `${item.rawData.urban_villages_count || 0} (міст/смт)`;
        details["Кількість сільських н.п. в області"] = `${item.rawData.rural_villages_count || 0} (сіл/селищ)`;
        if (typeof item.rawData.cities100_count !== "undefined") {
            details["Кількість міст понад 100 тис. осіб"] = item.rawData.cities100_count;
        }
    } else if (item.type === "region") {
        const rawSquare = parseFloat(item.rawData.square);
        const areaVal = !isNaN(rawSquare) ? rawSquare / 1000 : 0;
        details["Вид документації"] = "Схема планування території району";
        details["Площа району"] = areaVal > 0 ? `${areaVal.toFixed(2)} тис. км²` : "Дані відсутні";
        details["Чисельність населення"] = item.rawData.population ? `${Math.round(item.rawData.population).toLocaleString()} осіб` : "Дані відсутні";
        details["Кількість міських н.п. в районі"] = `${item.rawData.urban_villages_count || 0} (міст/смт)`;
        details["Кількість сільських н.п. в районі"] = `${item.rawData.rural_villages_count || 0} (сіл/селищ)`;
    } else if (item.type === "community") {
        const areaVal = item.rawData.square ? item.rawData.square / 1000 : 0;
        const popTotalVal = item.rawData.population ? item.rawData.population / 1000 : 0;

        let popCenterVal = item.rawData.center_population ? item.rawData.center_population / 1000 : 0;
        let isFallback = false;
        if (popCenterVal <= 0) {
            popCenterVal = Math.max(0.1, Math.min(popTotalVal, popTotalVal * 0.6));
            isFallback = true;
        }

        const ruralCount = parseInt(item.rawData.rural_villages_count) || 0;
        const urbanCount = parseInt(item.rawData.urban_villages_count) || 0;

        details["Вид документації"] = "Комплексний план просторового розвитку громади";
        details["Площа громади"] = areaVal > 0 ? `${areaVal.toFixed(3)} тис. м² (${item.rawData.square.toFixed(1)} км²)` : "Дані відсутні";
        details["Загальне населення громади"] = item.rawData.population ? `${item.rawData.population.toLocaleString()} осіб` : "Дані відсутні";

        if (item.rawData.center) {
            details["Адміністративний центр"] = item.rawData.center;
        }

        const labelCenterPop = isFallback ? "Населення адмінцентру (розрахунковий 60%)" : "Населення адмінцентру";
        details[labelCenterPop] = popTotalVal > 0 ? `${Math.round(popCenterVal * 1000).toLocaleString()} осіб` : "Дані відсутні";

        details["Кількість міських н.п. в громаді"] = `${urbanCount} (міст/смт)`;
        details["Кількість сільських н.п. в громаді"] = `${ruralCount} (сіл/селищ)`;
    } else if (item.type === "wikidata_city") {
        details["Вид документації"] = "Генеральний план населеного пункту";
        details["Площа НП"] = item.rawData.square ? `${item.rawData.square} км²` : "Дані відсутні";
        details["Чисельність населення"] = item.rawData.population ? `${item.rawData.population.toLocaleString()} осіб` : "Дані відсутні";
    }

    showConfirmationPopup(item, details);
}

function showConfirmationPopup(item, details) {
    const modal = document.getElementById("adminModal");
    const body = document.getElementById("adminModalBody");
    if (!modal || !body) return;

    let html = `
        <p>Ви дійсно бажаєте застосувати дані <strong>${item.title}</strong> до калькулятора?</p>
        <div class="applied-details-list">
    `;

    for (const [label, val] of Object.entries(details)) {
        html += `
            <div class="applied-detail-item">
                <span class="applied-detail-label">${label}:</span>
                <span class="applied-detail-value">${val}</span>
            </div>
        `;
    }

    html += `</div>`;
    body.innerHTML = html;

    modal.style.display = "flex";
    const applyBtn = document.getElementById("adminModalApplyBtn");
    if (applyBtn) {
        applyBtn.focus();
    }
}

function applyAdminUnit(item) {
    const nameInput = document.getElementById("projectName");
    if (nameInput) {
        let nameVal = "";
        if (item.type === "area") {
            nameVal = "Схема планування території області: " + item.title;
        } else if (item.type === "region") {
            nameVal = "Схема планування території району: " + item.title;
        } else if (item.type === "community") {
            nameVal = "Комплексний план просторового розвитку території: " + item.title;
        } else if (item.type === "wikidata_city") {
            nameVal = "Генеральний план населеного пункту: " + item.title;
        }

        if (nameVal) {
            nameInput.value = nameVal;
            nameInput.dispatchEvent(new Event("input", { bubbles: true }));
            nameInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
    }

    if (item.type === "area") {

        // 1. Switch to "Схема області" tab (regionalRegion)
        const tabBtn = document.querySelector(`.tab-btn[data-target="regionalRegion"]`);
        if (tabBtn) tabBtn.click();

        // 2. Set area (square / 1000)
        const areaVal = item.rawData.square ? item.rawData.square / 1000 : 0;
        const areaInput = document.getElementById("rr_area");
        if (areaInput && areaVal > 0) {
            areaInput.value = areaVal.toFixed(2);
            areaInput.dispatchEvent(new Event("input", { bubbles: true }));
        }

        // 3. Set population slider rr_f_pop
        const popVal = item.rawData.population ? item.rawData.population / 1000000 : 0; // in millions
        const sliderInput = document.getElementById("rr_f_pop");
        if (sliderInput && popVal > 0) {
            let sliderIdx = 0;
            if (popVal < 0.5) sliderIdx = 0;
            else if (popVal < 1.0) sliderIdx = 1;
            else if (popVal < 2.0) sliderIdx = 2;
            else if (popVal < 3.0) sliderIdx = 3;
            else sliderIdx = 4;

            sliderInput.value = sliderIdx;
            sliderInput.dispatchEvent(new Event("input", { bubbles: true }));
            sliderInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // 4. Set urban count slider rr_f_urban
        const urbanCount = parseInt(item.rawData.urban_villages_count) || 0;
        const urbanSliderInput = document.getElementById("rr_f_urban");
        if (urbanSliderInput) {
            let sliderIdx = 0;
            if (urbanCount <= 20) sliderIdx = 0;
            else if (urbanCount <= 50) sliderIdx = 1;
            else if (urbanCount <= 100) sliderIdx = 2;
            else sliderIdx = 3; // >100

            urbanSliderInput.value = sliderIdx;
            urbanSliderInput.dispatchEvent(new Event("input", { bubbles: true }));
            urbanSliderInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // 5. Set rural count slider rr_f_rural
        const ruralCount = parseInt(item.rawData.rural_villages_count) || 0;
        const ruralSliderInput = document.getElementById("rr_f_rural");
        if (ruralSliderInput) {
            let sliderIdx = 0;
            if (ruralCount < 1000) sliderIdx = 0;
            else if (ruralCount <= 1500) sliderIdx = 1;
            else sliderIdx = 2; // >1.5k

            ruralSliderInput.value = sliderIdx;
            ruralSliderInput.dispatchEvent(new Event("input", { bubbles: true }));
            ruralSliderInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // 6. Set cities over 100k count slider rr_f_cities100
        const cities100Count = parseInt(item.rawData.cities100_count) || 0;
        const cities100SliderInput = document.getElementById("rr_f_cities100");
        if (cities100SliderInput) {
            let sliderIdx = 0;
            if (cities100Count === 0) sliderIdx = 0;
            else if (cities100Count === 1) sliderIdx = 1;
            else if (cities100Count === 2) sliderIdx = 2;
            else if (cities100Count === 3) sliderIdx = 3;
            else sliderIdx = 4; // >3 міст

            cities100SliderInput.value = sliderIdx;
            cities100SliderInput.dispatchEvent(new Event("input", { bubbles: true }));
            cities100SliderInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

    } else if (item.type === "region") {
        // 1. Switch to "Схема району" tab (regionalDistrict)
        const tabBtn = document.querySelector(`.tab-btn[data-target="regionalDistrict"]`);
        if (tabBtn) tabBtn.click();

        // 2. Set area (square / 1000)
        const rawSquare = parseFloat(item.rawData.square);
        const areaVal = !isNaN(rawSquare) ? rawSquare / 1000 : 0;
        const areaInput = document.getElementById("rd_area");
        if (areaInput && areaVal > 0) {
            areaInput.value = areaVal.toFixed(2);
            areaInput.dispatchEvent(new Event("input", { bubbles: true }));
        }

        // 3. Set population slider rd_f_pop
        const popVal = item.rawData.population ? item.rawData.population / 1000 : 0; // in thousands
        const sliderInput = document.getElementById("rd_f_pop");
        if (sliderInput && popVal > 0) {
            let sliderIdx = 0;
            if (popVal < 40) sliderIdx = 0;
            else if (popVal < 70) sliderIdx = 1;
            else if (popVal < 110) sliderIdx = 2;
            else if (popVal < 150) sliderIdx = 3;
            else sliderIdx = 4;

            sliderInput.value = sliderIdx;
            sliderInput.dispatchEvent(new Event("input", { bubbles: true }));
            sliderInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // 4. Set urban count slider rd_f_urban
        const urbanCount = parseInt(item.rawData.urban_villages_count) || 0;
        const urbanSliderInput = document.getElementById("rd_f_urban");
        if (urbanSliderInput) {
            let sliderIdx = 0;
            if (urbanCount <= 1) sliderIdx = 0;
            else if (urbanCount === 2) sliderIdx = 1;
            else if (urbanCount === 3) sliderIdx = 2;
            else sliderIdx = 3; // >3

            urbanSliderInput.value = sliderIdx;
            urbanSliderInput.dispatchEvent(new Event("input", { bubbles: true }));
            urbanSliderInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // 5. Set rural count slider rd_f_rural
        const ruralCount = parseInt(item.rawData.rural_villages_count) || 0;
        const ruralSliderInput = document.getElementById("rd_f_rural");
        if (ruralSliderInput) {
            let sliderIdx = 0;
            if (ruralCount <= 100) sliderIdx = 0;
            else if (ruralCount <= 150) sliderIdx = 1;
            else if (ruralCount <= 200) sliderIdx = 2;
            else if (ruralCount <= 270) sliderIdx = 3;
            else if (ruralCount <= 350) sliderIdx = 4;
            else sliderIdx = 5; // >350

            ruralSliderInput.value = sliderIdx;
            ruralSliderInput.dispatchEvent(new Event("input", { bubbles: true }));
            ruralSliderInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

    } else if (item.type === "community") {
        // 1. Switch to "Комплексний план" tab (localComplexPlan)
        const tabBtn = document.querySelector(`.tab-btn[data-target="localComplexPlan"]`);
        if (tabBtn) tabBtn.click();

        // 2. Set area (square / 1000)
        const areaVal = item.rawData.square ? item.rawData.square / 1000 : 0;
        const areaInput = document.getElementById("cp_area");
        if (areaInput && areaVal > 0) {
            areaInput.value = areaVal.toFixed(3);
            areaInput.dispatchEvent(new Event("input", { bubbles: true }));
        }

        // 3. Set population total (population / 1000)
        const popTotalVal = item.rawData.population ? item.rawData.population / 1000 : 0; // in thousands
        const popTotalInput = document.getElementById("cp_pop_total");
        if (popTotalInput && popTotalVal > 0) {
            popTotalInput.value = popTotalVal.toFixed(1);
            popTotalInput.dispatchEvent(new Event("input", { bubbles: true }));
        }

        // 4. Set population center (estimate 60% of total if center population not available)
        const popCenterInput = document.getElementById("cp_pop_center");
        let popCenterVal = item.rawData.center_population ? item.rawData.center_population / 1000 : 0;
        if (popCenterVal <= 0 && popTotalVal > 0) {
            popCenterVal = Math.max(0.1, Math.min(popTotalVal, popTotalVal * 0.6));
        }
        if (popCenterInput && popCenterVal > 0) {
            popCenterInput.value = popCenterVal.toFixed(1);
            popCenterInput.dispatchEvent(new Event("input", { bubbles: true }));
        }

        // 5. Update other population automatically (subtracted)
        const popOtherInput = document.getElementById("cp_pop_other");
        if (popOtherInput && popTotalVal > 0 && popCenterVal > 0) {
            popOtherInput.value = Math.max(0, popTotalVal - popCenterVal).toFixed(1);
            popOtherInput.dispatchEvent(new Event("input", { bubbles: true }));
        }

        // 6. Set population slider cp_f_pop
        const sliderInput = document.getElementById("cp_f_pop");
        if (sliderInput && popTotalVal > 0) {
            let sliderIdx = 0;
            if (popTotalVal < 10) sliderIdx = 0;
            else if (popTotalVal < 30) sliderIdx = 1;
            else if (popTotalVal < 60) sliderIdx = 2;
            else if (popTotalVal < 120) sliderIdx = 3;
            else sliderIdx = 4;

            sliderInput.value = sliderIdx;
            sliderInput.dispatchEvent(new Event("input", { bubbles: true }));
            sliderInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // 7. Set rural count slider cp_f_rural
        const ruralCount = parseInt(item.rawData.rural_villages_count) || 0;
        const ruralSliderInput = document.getElementById("cp_f_rural");
        if (ruralSliderInput) {
            let sliderIdx = 0;
            if (ruralCount < 10) sliderIdx = 0;
            else if (ruralCount <= 30) sliderIdx = 1;
            else if (ruralCount <= 60) sliderIdx = 2;
            else if (ruralCount <= 120) sliderIdx = 3;
            else sliderIdx = 4;

            ruralSliderInput.value = sliderIdx;
            ruralSliderInput.dispatchEvent(new Event("input", { bubbles: true }));
            ruralSliderInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // 8. Set urban count slider cp_f_urban
        const urbanCount = parseInt(item.rawData.urban_villages_count) || 0;
        const urbanSliderInput = document.getElementById("cp_f_urban");
        if (urbanSliderInput) {
            let sliderIdx = 0;
            if (urbanCount === 0) sliderIdx = 0;
            else if (urbanCount === 1) sliderIdx = 1;
            else if (urbanCount === 2) sliderIdx = 2;
            else if (urbanCount === 3) sliderIdx = 3;
            else sliderIdx = 4;

            urbanSliderInput.value = sliderIdx;
            urbanSliderInput.dispatchEvent(new Event("input", { bubbles: true }));
            urbanSliderInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
    } else if (item.type === "wikidata_city") {
        // 1. Switch to "Генеральний план" tab (localGeneralPlan)
        const tabBtn = document.querySelector(`.tab-btn[data-target="localGeneralPlan"]`);
        if (tabBtn) tabBtn.click();

        // 2. Set population gp_pop (convert absolute value to thousands of people)
        const popVal = item.rawData.population ? item.rawData.population / 1000 : 0;
        const popInput = document.getElementById("gp_pop");
        if (popInput && popVal > 0) {
            popInput.value = popVal.toFixed(1);
            popInput.dispatchEvent(new Event("input", { bubbles: true }));
        }

        // 3. Set city type slider gp_city_k
        const cityKInput = document.getElementById("gp_city_k");
        if (cityKInput) {
            let sliderIdx = 0;
            if (item.title.includes("Київ") || item.rawData?.katottg === "UA80000000000093317") {
                sliderIdx = 2; // м. Київ та приміська зона
            } else if (item.rawData.population >= 1000000) {
                sliderIdx = 1; // Місто-мільйонник
            } else {
                sliderIdx = 0; // Звичайне місто
            }
            cityKInput.value = sliderIdx;
            cityKInput.dispatchEvent(new Event("input", { bubbles: true }));
            cityKInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
    }

    // Update all slider labels across the application
    updateSliderLabels();

    // Trigger calculation
    calc();

    // Toast confirmation
    showToast("Дані успішно застосовано");
}



