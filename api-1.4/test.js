var axios = require('axios');

function queryAllTenders(){
    axios.get('http://localhost:4000/tender/')
    .then(res => console.log(res.data))
    .catch(err => console.error(err))
}
// queryAllTenders();

function createUser() {
    data ={
        username: "ketanM",
        password: "12345678",
        email: "ketanM@email.com",
        // role: "Gov"
    }
    axios.post('http://localhost:4000/users/signup', data)
    .then(res => console.log(res))
    .catch(err => console.log(err))
}
createUser();
var token;
function login() {
    data= {
        username: "ganesh",
        password: "12345678"
    }
    axios.post('http://localhost:4000/users/login', data)
    .then(res => {
        console.log(res.data)
        token = res.data.token
    })
    .catch(err => console.log(err))
}
// login()

function createTender() {
    data ={
        headers: {
            Authorization: `Bearer ${token}`
        },
        body : {
            tenderKey : 'TENDER02',
            title: 'test Tender',
            status: 'open',
            workDescription: 'ex des',
            location: 'mumbai',   
            productCategory: 'ex category',
            bidValidity: '30 days',
            periodOfDate: '10/10/2020',
            publishDate: '10/10/2020',
            bidSubmissionStartDate: '10/10/2020',
            bidSubmissionEndDate:'10/10/2020',
            bidResultDate: '10/10/2020'
        }
    }
    axios.post('http://localhost:4000/tender', data)
    .then(res => console.log(res.data))
    .catch(err => console.log(err))
}
// createTender()
