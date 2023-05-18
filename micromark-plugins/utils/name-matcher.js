export function nameMatcher(validNames){
    let idx = 0; 
    let remainingNames = validNames; 
    return (code) => {
        remainingNames = remainingNames.filter(value => value.charCodeAt(idx) == code);
        if (remainingNames.length > 0) {
            idx++;
            return true;
        }
        return false;
    }
}  