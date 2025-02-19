export default function removeAccents(text: string): string {
    return text.replace(/[\u0300-\u036f]/g, "") // Remove combining diacritical marks
        .replace(
            /[áàâäãå]/g,
            "a"
        )
        .replace(
            /éèêë/ig,
            "e"
        )
        .replace(
            /[íìîï]/g,
            "i"
        )
        .replace(
            /óòôöõø/ig,
            "o"
        )
        .replace(
            /úùûüŭů/ig,
            "u"
        )
        .replace(
            /[ýÿ]/ig,
            "y"
        );
}