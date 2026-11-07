(() => {
      const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' : 'light';
      let savedTheme;
      try {
        savedTheme = window.localStorage.getItem('theme');
      } catch {
        // Local files can be opened with storage disabled.
      }
      document.documentElement.dataset.theme = savedTheme === 'dark' || savedTheme === 'light'
        ? savedTheme : systemTheme;

      document.getElementById('themeBtn').addEventListener('click', () => {
        const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = theme;
        try {
          window.localStorage.setItem('theme', theme);
        } catch {
          // Theme switching still works when storage is unavailable.
        }
      });
    })();
