import React, { PureComponent } from 'react';
import './App.css';
import { CSSTransition } from 'react-transition-group';



/*
*** Constants
*/

const NOTES = 'notes';
const TITLES = 'titles';



/*
*** Utils
*/

const updateLocalStorage = (itemName, value) => localStorage.setItem(itemName, JSON.stringify(value));

const updateLocalNotesAndTitles = (notes, titles) => {
    updateLocalStorage(NOTES, notes);
    updateLocalStorage(TITLES, titles);
};



/*
*** Components
*/

class Header extends PureComponent {
    render() {
        return (
            <header>
                <h1> Sticky Notes 2.0</h1>
                <button className="btnAdd" onClick={this.props.addNew}> Add a Note </button>
            </header>
        );
    }
}

class Note extends PureComponent {
    
    constructor(props) {
        super(props);
        this.state = {
            editMode: false
        };
        
        this.editNote = this.editNote.bind(this);
        this.removeNote = this.removeNote.bind(this);
        this.saveNote = this.saveNote.bind(this);
        
    }
    
    editNote() {
        this.setState({
            editMode: true
        });
    }
    
    removeNote() {
        this.props.deleteNoteFromContainer(this.props.index);
    }
    
    saveNote() {
        let newContent = this.newNote.value;
        let newTitle = this.newTitle.value;
        this.props.saveNoteFromContainer(newContent, this.props.index, newTitle);
        this.setState({
            editMode: false
        });
    }
    
    renderEditMode() {
        return (
		<div className="noteBlockBox">
			<CSSTransition 
			in={this.state.editMode}
			classNames="animateEdit"
			timeout={1000}
			>
            <div className="noteBlockEdit" key={this.props.index}> 
                <img className="pin" src="./img/pin.png" alt="Pin" title="Note pin" />
				<br />
				<label htmlFor="editTitle"> Note title: 
                <input id="editTitle" ref={newTitle => this.newTitle = newTitle} className="noteTitle" defaultValue={this.props.title} />
				</label>
				<br />
				<label htmlFor="editContent"> Note content: 
                <textarea id="editContent" ref={newNote => this.newNote = newNote} defaultValue={this.props.children} ></textarea> 
				</label>
                <button className="btnSave" onClick={this.saveNote}> Save </button>
            </div>
			</CSSTransition>
        </div>
        );
    }

    
    renderShowMode() {
        return (
		<div className="noteBlockBox">
			<CSSTransition 
			in={this.state.editMode}
			classNames="animateEdit"
			timeout={1000}
			>
                <div className="noteBlock">
                    <img className="pin" src="./img/pin.png" alt="Pin" title="Note pin" />
                    <h2 className="noteTitle"> {this.props.title} </h2>
                    <p className="noteText"> {this.props.children} </p>
                    <button className="btnEdit" onClick={this.editNote}> Edit </button>
                    <button className="btnRemove" onClick={this.removeNote}> Remove </button>
                </div>
			</CSSTransition>
        </div>
        );
    }
    
    render() {
        return this.state.editMode ? this.renderEditMode() : this.renderShowMode();
    }
}

class NotesContainer extends PureComponent {
    
    constructor(props) {
        super(props);
        
        this.state = {
            notes: JSON.parse(localStorage.getItem(NOTES)) || [],
            titles: JSON.parse(localStorage.getItem(TITLES)) || []
        };

        this.removeNoteContainer = this.removeNoteContainer.bind(this);
        this.updateNoteContainer = this.updateNoteContainer.bind(this);
        this.addNoteContainer = this.addNoteContainer.bind(this);
    }
    
    
    addNoteContainer(title, txt) {
        if (title && txt) {
            this.setState(prevState => {
                return ({
                    notes: [ ...prevState.notes, txt],
                    titles: [ ...prevState.titles, title]
                });
            }, () => {
                updateLocalNotesAndTitles(this.state.notes, this.state.titles);
            })		
        } else if (!title) {
            alert("Please fill in a proper title!");
        } else if (!txt) {
            alert("Please fill in a coresponding content for your note!");
        }
    }
    
    removeNoteContainer(ind) {
        this.setState(prevState => ({
            notes: prevState.notes.filter((_note, currentIndex) => currentIndex !== ind ),
            titles: prevState.titles.filter((_title, currentIndex) => currentIndex !== ind)
        }), () => {
            updateLocalNotesAndTitles(this.state.notes, this.state.titles);
        });
    }
    
    updateNoteContainer(newTextNote, ind, newTitleNote) {
        this.setState(prevState => ({
            notes: prevState.notes.reduce((acc, elem, index) => {
                !!(index === ind) ? acc.push(newTextNote) :  acc.push(elem)
                return acc;
            }, []),
            titles: prevState.titles.reduce((acc, elem, index) => {
                !!(index === ind) ? acc.push(newTitleNote) : acc.push(elem)
                return acc;
            }, [])
        }), () => {
            updateLocalNotesAndTitles(this.state.notes, this.state.titles);
        });
    }
	
    render() {
		let notes = this.state.notes;
		
        return (
            <div className="container">
                {
					notes.map((elem, i) => {
                        return (
                            <Note  key={i} index={i} title={this.state.titles[i]} deleteNoteFromContainer={this.removeNoteContainer} saveNoteFromContainer={this.updateNoteContainer}>
                                {elem}
                            </Note>
                        );
                    })
                } 
				
            </div>
        );
    }
}

class AddForm extends PureComponent {
    
    constructor(props) {
        super(props);
        
		this.state = {
			mounted: false
		};
		
        this.newAdd = this.newAdd.bind(this);
    }
	
	componentDidMount() {
		this.setState({mounted: true});
	}
    
    newAdd(evt) {
        evt.preventDefault();
        this.props.fromContainer(this.newAddTitle.value, this.newAddNote.value);
    }
    
    render() {
        return (
		<div>
			<CSSTransition 
			in={this.state.mounted}
			classNames="animateElem"
			timeout={800}
			>
				<form className="form">
					<label htmlFor="newAddTitle"> Note title:
					<input ref={newAddTitle => this.newAddTitle = newAddTitle} className="noteTitle" id="newAddTitle" />
					</label>
					<br />
					<label htmlFor="newAddContent"> Note content:
					<textarea ref={newAddNote => this.newAddNote = newAddNote} id="newAddContent" ></textarea>
					</label>
					<button onClick={this.newAdd} className="btnDone">Done</button>
				</form>
			</CSSTransition>
		</div>
        );
    }
}



// instead of using the regular normal structure folder (put components separately, etc),
// I decided to keep everything in this one single file
// because this is a very simple implementation

class App extends PureComponent {
    
    constructor(props) {
        super(props);
        
        this.state = {
            activateAdd: false,
            contentTitle: "",
            contentNote: ""
        };
        
        this.toggleAddState = this.toggleAddState.bind(this);
        this.saveData = this.saveData.bind(this);
    }
	
    toggleAddState() {
        this.setState(prevState => ({activateAdd: !prevState.activateAdd}));
    }
    
    saveData(arg1, arg2) {
        this.setState({contentTitle: arg1, contentNote: arg2}, function() {
            this.func.addNoteContainer(this.state.contentTitle, this.state.contentNote);
        });
        this.setState(prevState => ({activateAdd: !prevState.activateAdd}));
    }

    
    renderForm() {
        if (this.state.activateAdd) return (<AddForm fromContainer={this.saveData} />);
    }
    
    
    render() {
       return (
       <div className="app">
            <Header addNew={this.toggleAddState}/>
            {this.renderForm()}
            <NotesContainer ref={func => this.func = func} />     
       </div>
        );
    }
}

export default App;
