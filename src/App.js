import { useState, useEffect} from 'react'
import  comms  from './communication'


const PersonList = (props) => {
  const {list} = props
  

  return (
    <>
      <ul style={{listStyle: "none"}}>
        {list.map((person, i) => {return (
          <li key={i}>
            {person.name} {person.number}
            <button onClick={() => props.handleDelete(person)}>Delete</button>
          </li>
        )})}
      </ul>
    </>
  )
}

const PersonForm = ({nameCh, numCh, submit, name, num}) => {
  return(
    <form onSubmit={submit}>
        <div>
          name: <input value={name} onChange={nameCh}/>
        </div>
        <div>
          number: <input value={num} onChange={numCh}/>
        </div>
        <div>
          <button type="submit">add</button>
        </div>
    </form>
  )
}

const Filter = ({name, filterCh}) => {
  return(
    <>
     filter shown with: <input onChange={filterCh} value={name}/> 
    </>
  )
}


const App = () => {
  
  const [newName, setNewName] = useState('')
  const [newNum, setNewNum] = useState('')
  const [filter, setFilter] = useState('')
  const [persons, setPersons] = useState([]) 

  useEffect(() => {
    comms.getAll()
    .then((data)=> setPersons(data))
  },[]);

  async function handleDelete(person) {
    if(window.confirm(`Poistetaanko henkilö ${person.name}?`)){
      await comms.deletePerson(person.id);
      setPersons(persons.filter(p => p.id !== person.id))
    } 
  }
 
  const handleSubmit = (event) => {
    event.preventDefault()
    const person = {
      name: newName,
      number: newNum
    }

    const filtered = persons.filter(person => person.name === newName).pop()

    const checkAlert = async() => {
      if(filtered){
        if(window.confirm(`${newName} is already added to phonebook, replace old number with new one?`)){
          const newP = await comms.updatePerson({...filtered, number: newNum});
          setPersons(persons.map(p => p.id === filtered.id ? newP : p));
        }
      }else {
        setPersons(persons.concat(person))
        comms.create(person);
      }
    }

    checkAlert()
    setNewName('')
    setNewNum('')
  }

  const handleNameChange = ({target}) => setNewName(target.value)
  const handleNumChange = ({target}) => setNewNum(target.value)
  




  return (
    <div>
      <h2>Phonebook</h2>
      <Filter name={filter} filterCh={({target}) => setFilter(target.value)}/>
      <PersonForm 
      nameCh={handleNameChange} 
      numCh={handleNumChange} 
      submit={handleSubmit}
      name={newName}
      num={newNum}
      />
      <h2>Numbers</h2>
      <div>
        <PersonList handleDelete={handleDelete} list={filter.length > 0 ? persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase())) : persons} />
      </div>
    </div>
  )
}

export default App
