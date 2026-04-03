import { useState } from 'react'


function App() {
  const [first_name, setFirst_name] = useState('')
  const [last_name, setLast_name] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()

    fetch('http://localhost:3000/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name,
        last_name,
        email,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Success:', data)
      })
      .catch((err) => {
        console.error('Error:', err)
      })
     
    console.log(first_name, last_name, email)
  }



  return (
    <form onSubmit={handleSubmit}>
      {/*input first name*/}
      <label>First Name</label>
      <input
        type="text"
        value={first_name}
        onChange={(e) => setFirst_name(e.target.value)}
      />
      {/*input last name*/}
      <label>Last Name</label>
      <input
        type="text"
        value={last_name}
        onChange={(e) => setLast_name(e.target.value)}
      />
      {/*input phone*/}
      <label>Phone</label>
      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />



      {/*input email*/}
      <label>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <>
        <button type="submit">Submit</button>
      </>
      
    </form>
  )
}

export default App
