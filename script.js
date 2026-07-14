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
    setupAnimatedDetails('formulaDetails');
    restoreStateFromUrl();
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

function initEventListeners() {
    const inputs = document.querySelectorAll("input, select");
    inputs.forEach(el => {
        el.addEventListener("input", calc);
        el.addEventListener("change", calc);
    });

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

    // Paste Project Name trigger
    const pasteBtn = document.getElementById("pasteProjectNameBtn");
    const nameInput = document.getElementById("projectName");
    if (pasteBtn && nameInput) {
        pasteBtn.addEventListener("click", async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    nameInput.value = text;
                    nameInput.dispatchEvent(new Event("input", { bubbles: true }));
                    nameInput.dispatchEvent(new Event("change", { bubbles: true }));
                    showToast("Назву вставлено");
                }
            } catch (err) {
                console.error("Failed to read clipboard: ", err);
                showToast("Не вдалося отримати доступ до буфера обміну");
            }
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
}

function resetAllInputs() {
    // Number inputs defaults
    const numDefaults = {
        kzag: "43.36", kdir: "1.01",
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

function updateFormulaBox(docType, p, A, B, K, Kzag, Kdir, notes) {
    const formulaBox = document.getElementById("formulaBox");
    if (!formulaBox) return;

    let content = "";

    if (docType === "stateParts") {
        content = `
            <strong>Розрахунок Схеми планування окремої частини України</strong><br>
            Формула (п. 2.3): <code>C = (A + B × P) × Кзаг × К × Кдир</code><br><br>
            <strong>Поточні значення змінних:</strong><br>
            • <code>P</code> (площа) = <b>${p}</b> тис. км²<br>
            • <code>A</code> = <b>${A.toLocaleString()}</b> грн, <code>B</code> = <b>${B.toLocaleString()}</b> грн (з Таблиці 3-1)<br>
            • <code>Кзаг</code> = <b>${Kzag.toFixed(2)}</b> (індекс переходу)<br>
            • <code>Кдир</code> = <b>${Kdir.toFixed(2)}</b> (частка прямих витрат)<br>
            • <code>К</code> = <b>${K.toFixed(4)}</b> (коефіцієнт складності)<br><br>
            <em>Примітки:</em> ${notes || "немає"}
        `;
    } else if (docType === "regionalRegion") {
        content = `
            <strong>Розрахунок Схеми планування території області</strong><br>
            Формула (п. 2.3): <code>C = (A + B × P) × Кзаг × К × Кдир</code><br><br>
            <strong>Поточні значення змінних:</strong><br>
            • <code>P</code> (площа) = <b>${p}</b> тис. км²<br>
            • <code>A</code> = <b>${A.toLocaleString()}</b> грн, <code>B</code> = <b>${B.toLocaleString()}</b> грн (з Таблиці 4-1)<br>
            • <code>Кзаг</code> = <b>${Kzag.toFixed(2)}</b> (індекс переходу)<br>
            • <code>Кдир</code> = <b>${Kdir.toFixed(2)}</b> (частка прямих витрат)<br>
            • <code>К</code> = <b>${K.toFixed(4)}</b> (коефіцієнт складності)<br><br>
            <em>Примітки:</em> ${notes || "немає"}
        `;
    } else if (docType === "regionalDistrict") {
        content = `
            <strong>Розрахунок Схеми планування території району</strong><br>
            Формула (п. 2.3): <code>C = (A + B × P) × Кзаг × К × Кдир</code><br><br>
            <strong>Поточні значення змінних:</strong><br>
            • <code>P</code> (площа) = <b>${p}</b> тис. км²<br>
            • <code>A</code> = <b>${A.toLocaleString()}</b> грн, <code>B</code> = <b>${B.toLocaleString()}</b> грн (з Таблиці 4-3)<br>
            • <code>Кзаг</code> = <b>${Kzag.toFixed(2)}</b> (індекс переходу)<br>
            • <code>Кдир</code> = <b>${Kdir.toFixed(2)}</b> (частка прямих витрат)<br>
            • <code>К</code> = <b>${K.toFixed(4)}</b> (коефіцієнт складності)<br><br>
            <em>Примітки:</em> ${notes || "немає"}
        `;
    } else if (docType === "localComplexPlan") {
        content = `
            <strong>Розрахунок Комплексного плану просторового розвитку громади (місцевий рівень)</strong><br>
            Формула (п. 2.2): <code>C = C_містобуд + C_землевпоряд</code><br><br>
            <strong>Складові містобудівної частини (п. 2.9):</strong><br>
            • <code>С_площі</code> (від площі території громади) за Таблицею 5-1<br>
            • <code>С_адмінцентру</code> (від населення адмінцентру) за Таблицею 5-3<br>
            • <code>С_інших_нп</code> (від населення інших нп) за Таблицею 5-3 (примітка: у Настанові помилково вказана Табл. 5-1)<br>
            • <code>C_містобуд = (С_площі + С_адмінцентру + С_інших_нп) × К_містобуд × Кзаг × Кдир</code><br><br>
            <strong>Складові землевпорядної частини (п. 6.1):</strong><br>
            • <code>С_населення</code> (від населення громади) за Таблицею 6-1 (значення в тис. грн) × К3 (землекористувачі) × К4 (категорії земель)<br>
            • <code>С_площі_зем</code> (від площі громади в км²) за Таблицею 6-3 (значення в тис. грн)<br>
            • <code>C_землевпоряд = (С_населення + С_площі_зем) × К_землевпоряд × Кзаг × Кдир</code>
        `;
    } else if (docType === "localGeneralPlan") {
        content = `
            <strong>Розрахунок Генерального плану населеного пункту</strong><br>
            Формула (п. 2.3): <code>C = (A + B × P) × Кзаг × К × Кдир</code><br><br>
            <strong>Поточні значення змінних:</strong><br>
            • <code>P</code> (населення) = <b>${p}</b> тис. осіб<br>
            • <code>A</code> = <b>${A.toLocaleString()}</b> грн, <code>B</code> = <b>${B.toLocaleString()}</b> грн (з Таблиці 5-3)<br>
            • <code>Кзаг</code> = <b>${Kzag.toFixed(2)}</b> (індекс переходу)<br>
            • <code>Кдир</code> = <b>${Kdir.toFixed(2)}</b> (частка прямих витрат)<br>
            • <code>К</code> = <b>${K.toFixed(4)}</b> (з урахуванням п. 5.10 для міст-мільйонників/Києва)<br><br>
            <em>Примітки:</em> ${notes || "немає"}
        `;
    } else if (docType === "localDetailedPlan") {
        content = `
            <strong>Розрахунок Детального плану території (ДПТ)</strong><br>
            Формула (п. 2.2): <code>C = C_містобуд + C_землевпоряд</code><br><br>
            <strong>Містобудівна складова (Таблиця 5-4):</strong><br>
            • <code>C_містобуд = C_базова_містобуд × К_містобуд × Кзаг × Кдир</code><br>
            • <code>К_містобуд</code> включає: масштабний коефіцієнт (п. 5.17: 1:1000 - 1.25, 1:500 - 1.5) та коефіцієнт типу території (п. 5.18: центр міста, історичний ареал тощо - 1.1)<br><br>
            <strong>Землевпорядна складова (Таблиця 6-5):</strong><br>
            • <code>C_землевпоряд = C_базова_землевп × К_землевпоряд × Кзаг × Кдир</code>
        `;
    }

    formulaBox.innerHTML = linkifyReferences(content);
}

// --- DYNAMIC CALCULATOR EXECUTOR ---

function calc() {
    const activeTab = document.querySelector(".tab-btn.active");
    if (!activeTab) return;

    const docType = activeTab.getAttribute("data-target");

    // Clear previous field warning icons
    document.querySelectorAll(".field-warning-icon").forEach(el => el.innerHTML = "");
    let warningFieldId = "";

    const output = document.getElementById("output");
    const outputBottom = document.getElementById("outputBottom");

    const resultMain = document.getElementById("resultMain");
    const resultMainBottom = document.getElementById("resultMainBottom");

    const globalKzag = getInputValue("kzag", 1.0);
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

        updateFormulaBox("stateParts", p, activeA, activeB, K, globalKzag, globalKdir, res.note);

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

        updateFormulaBox("regionalRegion", p, activeA, activeB, K, globalKzag, globalKdir, res.note);

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

        updateFormulaBox("regionalDistrict", p, activeA, activeB, K, globalKzag, globalKdir, res.note);

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
            
            const errorHtml = `Помилка <span class="result-value real result-nowrap" style="color: #dc2626;">розрахунку</span>`;
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
        landCost = (z1 + z2) * K_land * globalKzag * globalKdir;

        finalDocCost = mistCost + landCost;

        updateFormulaBox("localComplexPlan");

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

        updateFormulaBox("localGeneralPlan", p, activeA, activeB, K, globalKzag, globalKdir, res.note);

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
        landCost = baseLand * K_land * globalKzag * globalKdir;

        finalDocCost = mistCost + landCost;

        updateFormulaBox("localDetailedPlan");

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
    data.push(["Коефіцієнт Кзаг (Додаток 7):", calcResult.globalKzag]);
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
    data.push(["ВСЬОГО (з урахуванням ПДВ та експертизи):", calcResult.totalWithVat]);

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
                        <td>Коефіцієнт Кзаг (Додаток 7, п. 2)</td>
                        <td style="text-align: right;">${calcResult.globalKzag}</td>
                    </tr>
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
        <tr class="grand-total"><td><b>ВСЬОГО (з урахуванням ПДВ та експертизи):</b></td><td style="text-align: right;"><b>${formatCurrency(calcResult.totalWithVat)}</b></td></tr>
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
    
    return html.replace(regex, function(match, g1, g2, g3, g4, g5, g6, g7, g8) {
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
            doReset();
        } else {
            zeroMd.addEventListener('zero-md-rendered', doReset, { once: true });
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
        doScroll();
    } else {
        // Wait for rendering event
        zeroMd.addEventListener('zero-md-rendered', () => {
            setTimeout(doScroll, 150);
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
        resizer.addEventListener('mousedown', function(e) {
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
    document.addEventListener('click', function(e) {
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

