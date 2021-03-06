'use strict'

import React from 'react'
import $ from 'jquery'
import UnitTemplateProfileShareButtons from './unit_templates_manager/unit_template_profile/unit_template_profile_share_buttons'
import LoadingIndicator from '../shared/loading_indicator'

export default  React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object,
    type: React.PropTypes.string
  },

  getInitialState: function() {
    return {loading: true}
  },

  getDefaultProps: function() {
    // the only time we won't pass this is if they are assigning the diagnostic,
    // but actions shouldn't be undefined
    return {actions: {getInviteStudentsUrl: function(){'placeholder function'}}}
  },

  hideSubNavBars: function() {
    $('.unit-tabs').hide();
    $('.tab-outer-wrap').hide();
    $('.section-content-wrapper').hide();
  },

  activityName: function() {
    return this.props.data.name;
  },

  anyClassroomsWithStudents: function(classrooms) {
    return !!classrooms.find((e) => e.students.length > 0)
  },

  componentWillMount: function() {
    const that = this;
    if(typeof this.props.actions.studentsPresent === 'undefined') {
      $.ajax({
        url: '/teachers/classrooms_i_teach_with_students',
        dataType: 'json',
        success: function(data) {
          that.setState({loading: false, studentsPresent: that.anyClassroomsWithStudents(data.classrooms) });
        }
      });
    } else {
      this.setState({loading: false, studentsPresent: this.props.actions.studentsPresent });
    }
  },

  teacherSpecificComponents: function() {
    this.hideSubNavBars();

    let href;
    let text;

    if (this.props.type === 'diagnostic' || this.state.studentsPresent) {
      href = '/teachers/classrooms/activity_planner';
      text = 'View Assigned Activity Packs';
    } else {
      href = this.props.actions.getInviteStudentsUrl();
      text = 'Add Students'
    }

    return (
      <span>
            <a href={href}>
              <button onClick className="button-green add-students pull-right">
                {text} <i className="fa fa-long-arrow-right"></i>
              </button>
            </a>
      </span>
    )
  },



  render: function () {
    if(this.state.loading) {
      return(<LoadingIndicator />);
    }

    $('html,body').scrollTop(0);
    return (
      <div className='assign-success-container'>
    <div className='successBox'>
      <div className='container'>
        <div className='row' id='successBoxMessage'>
          <div className='col-md-9 successMessage'>
            <i className="fa fa-check-circle pull-left"></i>You’ve successfully assigned the <strong>{this.activityName()}</strong> Activity Pack!
          </div>
          <div className='col-md-4'>
            {this.teacherSpecificComponents()}
          </div>
        </div>
      </div>
    </div>
    <div className='sharing-container'>
      <h2>
        Share Quill With Your Colleagues
      </h2>
        <p className='nonprofit-copy'>
          We’re a nonprofit providing free literacy activities. The more people <br></br>
          that use Quill, the more free activities we can create.
        </p>
      <p className='social-copy'>
        <i>I’m using the {this.activityName()} Activity Pack, from Quill.org, to teach English grammar. quill.org/activity_packs/{this.props.data.id}</i>
      </p>
      <div className='container'>
        <UnitTemplateProfileShareButtons data={this.props.data} />
      </div>
    </div>
    </div>
  );
  }
});
