# [Nolia DB tools](https://randomscience.github.io/nolia_erp_investigation/)
Temp repo with simple summaries of nolia resources


# GH pages deploy

1. run deploy script
```bash
npm run deploy
``` 
2. fix errors if necessary
3. correct assets paths in [index.html](https://github.com/randomscience/nolia_erp_investigation/blob/gh-pages/index.html) file by adding `https://randomscience.github.io/nolia_erp_investigation/`. According to the documentation this step should be handled automatically by population `homepage` variable in `package.json`, but it does not work for me for some reason :c
    `