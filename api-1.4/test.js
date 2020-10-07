var axios = require('axios');

queryAllTenders => {
    axios.get('http://localhost:4000/tender/')
    .then(res => console.log(res.data))
    .catch(err => console.error(err))
}
queryAllTenders();