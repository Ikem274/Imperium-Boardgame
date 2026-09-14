/**
 * This is an integration fix, so that Ramda can be imported in the same way
 * both on server and on browser, and also not trip jslint.
 */
import * as R from "https://cdn.jsdelivr.net/npm/ramda@0.32.0/es/index.js";
export default R;
