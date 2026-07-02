
const defaultCatalog = {};

let AZHAGII_CATALOG = {};
const stored = localStorage.getItem('AZHAGII_CATALOG_V2');
if (stored) {
    try {
        AZHAGII_CATALOG = JSON.parse(stored);
    } catch(e) {
        AZHAGII_CATALOG = defaultCatalog;
        localStorage.setItem('AZHAGII_CATALOG_V2', JSON.stringify(AZHAGII_CATALOG));
    }
} else {
    AZHAGII_CATALOG = defaultCatalog;
    localStorage.setItem('AZHAGII_CATALOG_V2', JSON.stringify(AZHAGII_CATALOG));
}

window.AZHAGII_CATALOG = AZHAGII_CATALOG;

window.saveCatalog = function(newCatalog) {
    window.AZHAGII_CATALOG = newCatalog;
    localStorage.setItem('AZHAGII_CATALOG_V2', JSON.stringify(window.AZHAGII_CATALOG));
};
