'use strict';
import React from 'react'
import ConceptResultStat from './concept_result_stat.jsx'
import $ from 'jquery'

export default React.createClass({
  propTypes: {
    results: React.PropTypes.array.isRequired
  },

  addTotalAndPercentageToConRes: function (conResArr) {
    conResArr.forEach(conRes => {
      conRes.total = conRes.incorrect + conRes.correct;
      conRes.percentage = conRes.correct/ conRes.total
    });
  },

  sortedStats: function(statsAsArr) {
    return statsAsArr.sort((conRes1, conRes2) => {
      this.addTotalAndPercentageToConRes([conRes1, conRes2])
      if (conRes1.total !== conRes2.total) {
        return conRes2.total - conRes1.total;
      }
      // then sort by percentage
      if (conRes1.percentage !== conRes2.percentage) {
        return conRes2.percentage - conRes1.percentage;
      }
      // finally, sort alphabetically
      return conRes2.name - conRes1.name;
    })
  },

  statsRows: function() {
    const statsRows = [];
    const stats = this.calculateStats();
    // loop through to the end of the array or 9. which ever is less
    const maxNumOfResults = stats.length > 10 ? 10 : stats.length
    for (let i = 0; i < maxNumOfResults; i++) {
      const statsRow = stats[i];
      statsRows.push(<ConceptResultStat key = {statsRow.name}
                                   name = {statsRow.name}
                                   correct={statsRow.correct}
                                   incorrect={statsRow.incorrect} />);
    }
    const additionalInfoRow = this.additionalInfoRow(statsRows.length, stats.length)
    return statsRows.concat(additionalInfoRow);
  },

  additionalInfoRow: function(statsRowsLen, statsLen){
    let message;
    let lengthDiff = statsLen - statsRowsLen;
    if (lengthDiff > 0) {
      message = `+ ${lengthDiff} additional concepts in the activity report.`
    } else if (statsRowsLen) {
      message = 'Clicking on the activity icon loads the report.'
    }
    return (
      <div  key='link_to_report'>
        <div className='tooltip-message'>{message}</div>
      </div>
    );
  },

  objectToArray: function(calculatedStats){
     return $.map(calculatedStats, (value, index) => [value]);
   },

  calculateStats: function() {
    var stats = this.props.results.reduce(function (memo, conceptResult) {
      var statsRow = memo[conceptResult.concept.name] || {
        name: conceptResult.concept.name,
        correct: 0,
        incorrect: 0,
      };
      memo[conceptResult.concept.name] = statsRow;
      var correct = parseInt(conceptResult.metadata.correct);
      if (correct) {
        statsRow.correct++;
      } else {
        statsRow.incorrect++;
      }
      return memo;
    }, {});
    const statsAsArr = this.objectToArray(stats);
    const sortedStats = this.sortedStats(statsAsArr);
    return sortedStats;
  },

  render: function () {
    return (
      <div className='concept-stats container'>
        {this.statsRows()}
      </div>
    );
  }
});
