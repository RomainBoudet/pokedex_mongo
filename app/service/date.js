const dayjs = require('dayjs');
require('dayjs/locale/fr')
//const utc = require('dayjs/plugin/utc');
//const timezone = require('dayjs/plugin/timezone');

dayjs.locale('fr');

const formatToast = () => {
    date = dayjs(new Date).format('H:mm');
    return date;
}


module.exports = {
    formatToast,
}