import './App.css';
import { useState } from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

import britInsuranceLogo from './brit-insurance-logo.png';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const client = axios.create({
  baseURL: "http://localhost:8000"
});

function App() {

  const [currentUser, setCurrentUser] = useState();
  const [signupToggle, setSignupToggle] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [items, setItems] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState(null);

  function updateFormBtn() {
    const btnText = signupToggle ? "Signup" : "Login";
    document.getElementById("form_btn").innerText = btnText;
    setSignupToggle(!signupToggle);
  }

  function handleApiError(error) {
      const backendError = error.response?.data || "An error occurred. Please try again later.";
      setError(backendError);
      console.error("API error:", error);

      setTimeout(() => {
        setError(null);
      }, 5000);      
  }

  function submitSignup(e) {
    e.preventDefault();
    client.post(
      "/signup",
      {
        email: email,
        username: username,
        password: password
      }
    ).then(function(res) {
      client.post(
        "/login",
        {
          username: username,
          password: password
        }
      ).then(function(res) {
        const token = res.data.token;
        client.defaults.headers.common['Authorization'] = `Token ${token}`;
        setCurrentUser(true);
        fetchItems();
        setShowSummary(false);
      }).catch(handleApiError);
    });
  }

  function fetchSummaryData(e) {
    e.preventDefault();
    client.get("/summary")
      .then(response => {
        setSummaryData(response.data);
        setShowSummary(true);
      })
      .catch(error => {
        console.error("Error fetching summary:", error);
      });
  }

  function hideSummaryData(e) {
    e.preventDefault();
    setShowSummary(false);
  }

  function submitLogin(e) {
    e.preventDefault();
    client.post(
      "/login",
      {
        username: username,
        password: password
      }
    ).then(function(res) {
      const token = res.data.token;
      client.defaults.headers.common['Authorization'] = `Token ${token}`;      
      setCurrentUser(true);
      fetchItems();
      setShowSummary(false);
    }).catch(handleApiError);
  }

  function submitLogout(e) {
    e.preventDefault();
    client.post(
      "/logout",
      {withCredentials: true}
    ).then(function(res) {
      setCurrentUser(false);
      setItems([]);
    });
  }

  function fetchItems() {
    client.get("/items")
      .then(response => {
        setItems(response.data);
      })
      .catch(error => {
        console.error("Error fetching items:", error);
      });
  }

  if (currentUser) {
    return (
      <div>
        <Navbar bg="dark" variant="dark">
          <Container>
          <Navbar.Brand>
            <img
              alt="Insurance Logo"
              src={britInsuranceLogo}
              width="40"
              height="30"
              className="d-inline-block align-top"
            />{' '}
            Insurance Challenge
          </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text>
                <form onSubmit={e => submitLogout(e)}>
                  <Button type="submit" variant="light">Logout</Button>
                </form>
              </Navbar.Text>
            </Navbar.Collapse>
          </Container>
        </Navbar>
          <div className="center">
          {showSummary ? ( 
                      <Form className="d-flex flex-column align-items-center" onSubmit={e => hideSummaryData(e)}>
                      <Form.Group xs={12} md={8} lg={9}>
                              <div>
                              {summaryData && (
                                <div>
                                  <p>Summary:</p>
                                  <pre>{JSON.stringify(summaryData, null, 2)}</pre>
                                </div>
                              )}
                            </div>
                            </Form.Group>
                            <Form.Group xs={12} md={4} lg={3} className="mt-3 mb-3">
                              <Button variant="primary" type="submit">Back</Button>
                            </Form.Group>
                  </Form>                          
          ) : (        
          <Form className="d-flex flex-column align-items-center" onSubmit={e => fetchSummaryData(e)}>
            <Form.Group xs={12} md={8} lg={9}>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price (£)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.price}</td>
                    </tr>
                  ))}                             
                </tbody>
              </Table>
            </Form.Group>
            <Form.Group xs={12} md={4} lg={3} className="mt-3 mb-3">
              <Button variant="primary" type="submit">Summary</Button>
            </Form.Group>
          </Form>)}
          </div>
        </div>
    );
  }
  return (
    <div>
    <Navbar bg="dark" variant="dark">
      <Container>
      <Navbar.Brand>
            <img
              alt="Insurance Logo"
              src={britInsuranceLogo}
              width="40"
              height="30"
              className="d-inline-block align-top"
            />{' '}
            Insurance Challenge
          </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            <Button id="form_btn" onClick={updateFormBtn} variant="light">Signup</Button>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    {error && <p className="text-danger d-flex flex-column align-items-center">{error}</p>}
    {
      signupToggle ? (
        <div className="center">
          <Form onSubmit={e => submitSignup(e)}>
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} />
              <Form.Text className="text-muted">
                Needs to be unique
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </div>        
      ) : (
        <div className="center">
          <Form onSubmit={e => submitLogin(e)}>
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </div>
      )
    }
    </div>
  );
}

export default App;
