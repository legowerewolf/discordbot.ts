export const INFO = 0;
export const WARN = 1;
export const ERROR = 2;
export const ERROR_LEVEL_PREFIXES = ["[INFO]  ", "[WARN]  ", "[ERROR] "];

export let Prefixer = {
    maxLength: 0,
    log: function (name: string, message: string) {
        let prefix = "[" + name + "]";
        prefix += " ".repeat(this.maxLength - prefix.length);
        console.log(prefix + message);
    },
    prepare: function (name: string) {
        if (name.length + 3 > this.maxLength) {
            this.maxLength = name.length + 3;
        }
    }
};