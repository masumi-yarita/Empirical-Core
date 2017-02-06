'use strict'
import React from 'react'
import ClassroomsWithStudents from '../components/lesson_planner/create_unit/stage2/ClassroomsWithStudents.jsx'
import UnitTabs from '../components/lesson_planner/unit_tabs'
import LoadingIndicator from '../components/general_components/loading_indicator.jsx'

export default class extends React.Component {
	constructor(props) {
		super(props);
		this.getClassroomsAndStudentsData();
	}

	state = {
		classrooms: null,
		loading: true,
		studentsChanged: false
	}

	findTargetClassIndex(classroomId) {
		return this.state.classrooms.findIndex((classy)=>{
			return classy.id === classroomId
		})
	}

	findTargetStudentIndex(studentId, targetClassIndex) {
		return this.state.classrooms[targetClassIndex].students.findIndex(
			(stud)=>{
				return stud.id===studentId
		})
	}

	// Emilia and Ryan discussed that it may make more sense for the AJAX
	// call to return a data structure like:
	// {
	//   classrooms: [{
	//     id: 23,
	//     name: 'English 2',
	//     students: {
	//       12323: {
	//         'Ryan'
	//       }
	//     }
	//   }]
	// ]
	// units: [
	//   id: 1232,
	//   name: 'Adjectives',
	//   classroom_activities: [{
	//     classroom: 23,
	//     assigned_student_ids: [23]
	//   }]
	// ]
	// }
	// this would allow us to iterate over the assigned_student_ids
	// and then change the students to selected/not selected based off of the results
	toggleStudentSelection = (studentIndex, classIndex) => {
		const newState = Object.assign({}, this.state);
		const classy = newState.classrooms[classIndex]
	  let selectedStudent = classy.students[studentIndex]
		selectedStudent.isSelected = !selectedStudent.isSelected;
		if (newState.studentsChanged)
			if (selectedStudent.isSelected) {
				classy.allSelected = this.checkIfAllAssigned(classy)
			} else {
				classy.allSelected = false
			}
		this.setState(newState)
	}

	handleStudentCheckboxClick = (studentId, classroomId) =>{
		const newState = Object.assign({}, this.state);
		const classIndex = this.findTargetClassIndex(classroomId)
		const studentIndex = this.findTargetStudentIndex(studentId, classIndex)
		newState.classrooms[classIndex].edited = true;
		newState.studentsChanged = true;
		this.setState(newState, () => this.toggleStudentSelection(studentIndex, classIndex));
	}

	toggleClassroomSelection = (classy) => {
		const newState = Object.assign({}, this.state);
		const classIndex = this.findTargetClassIndex(classy.id);
		const classroom = newState.classrooms[classIndex];
		classroom.edited = true;
		classroom.allSelected = !classroom.allSelected;
		classroom.students.forEach((stud)=>stud.isSelected=classroom.allSelected);
		newState.studentsChanged = true;
		this.setState(newState, console.log(this.state.classrooms));
	}

	// it is not the case that there are some students that are not selected
	checkIfAllAssigned = classy => !classy.students.some(stud => !stud.isSelected)

	selectPreviouslyAssignedStudents() {
	// 	// @TODO if (window.location.pathname.includes('edit')) {
		const newState = Object.assign({}, this.state);
			newState.classrooms.forEach((classy, classroomIndex) => {
				const ca = classy.classroom_activity
				if (ca) {
						let count = 0;
						if (ca.assigned_student_ids && ca.assigned_student_ids.length > 0) {
							ca.assigned_student_ids.forEach((studId) => {
								let studIndex = this.findTargetStudentIndex(studId, classroomIndex);
								this.toggleStudentSelection(studIndex, classroomIndex)
								count += 1;
							})
						} else {
							classy.students.forEach((stud, studIndex) => {
								this.toggleStudentSelection(studIndex, classroomIndex)
								count += 1;
						})
					}
					classy.allSelected = count === classy.students.length
				}
			})
			this.setState(newState)
	}

	getClassroomsAndStudentsData() {
		const that = this;
		$.ajax({
			type: 'GET',
			url: `/teachers/units/${that.props.params.unitId}/classrooms_with_students_and_classroom_activities`,
			statusCode: {
				200: function(data) {
					that.setState({loading: false, classrooms: data.classrooms, unitName: data.unit_name})
					that.selectPreviouslyAssignedStudents()
				},
				422: function(response) {
					that.setState({errors: response.responseJSON.errors,
					loading: false})
				}
			}
		})
	}

	render() {
		if (this.state.loading) {
			return <LoadingIndicator/>
		} else if (this.state.classrooms) {
			return (
				<div>
					<UnitTabs tab={this.state.tab} toggleTab={this.toggleTab}/>
						<div className='container lesson_planner_main edit-assigned-students-container'>
								<ClassroomsWithStudents
									unitId={this.props.params.unitId}
									unitName={this.state.unitName}
									classrooms={this.state.classrooms}
									handleStudentCheckboxClick={this.handleStudentCheckboxClick.bind(this)}
									toggleClassroomSelection={this.toggleClassroomSelection}
									saveButtonEnabled={this.state.studentsChanged}
									/>
							</div>
						</div>)
		} else {
			return <div>You must first add a classroom.</div>
		}
	}

}