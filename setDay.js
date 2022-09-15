
exports.getDate = function () {
    let today = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    let day = today.toLocaleDateString("en-US", options);
    return day;
}


exports.getDay = function () {
    let today = new Date();

    const options = {
        weekday: "long"
    };

    let day = today.toLocaleDateString("en-US", options);
    return day;
}