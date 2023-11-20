function removeTimeStamps(text) {
    // Use regular expression to remove timestamps
    const timestampRegex = /[\[\(]\s*(\d{1,2}:)?\d{1,2}:\d{2}\s*[\]\)]/g;
    return text.replace(timestampRegex, '');
}

 export {removeTimeStamps};