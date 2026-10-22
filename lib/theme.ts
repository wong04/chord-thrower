/** Same key + JSON encoding as usePersistentState ("ipt." prefix), kept separate so the server layout can import it. */
export const THEME_STORAGE_KEY = "ipt.theme";

/**
 * Runs in <head> before first paint: apply the saved theme, else follow the OS setting,
 * so dark-mode users never see a flash of the light page.
 */
export const THEME_INIT_SCRIPT = `(function(){var t;try{t=JSON.parse(localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}))}catch(e){}if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t})()`;
