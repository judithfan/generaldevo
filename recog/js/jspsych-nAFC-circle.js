/**
 *
 * jspsych-nAFC-circle
 * Judy Fan
 *
 * displays a target image at center surrounded by several unique images
 * positioned equidistant from the target.
 * participant's goal is to click on the surround image that best matches the target.
 *
 *
 * requires Snap.svg library (snapsvg.io)
 *
 * documentation: docs.jspsych.org || TBD
 *
 **/

(function($) {
  jsPsych["nAFC-circle"] = (function() {

    var plugin = {};

    plugin.create = function(params) {

      var trials = new Array(params.options.length);

      for (var i = 0; i < trials.length; i++) {
        trials[i] = {};
        trials[i].target_present = params.target_present[i];
        trials[i].set_size = params.set_size[i];
        trials[i].target = params.target;
        trials[i].foil = params.foil;
        trials[i].fixation_image = params.fixation_image;
        trials[i].target_size = params.target_size || [50, 50];
        trials[i].fixation_size = params.fixation_size || [16, 16];
        trials[i].circle_diameter = params.circle_diameter || 250;
        trials[i].target_present_key = params.target_present_key || 74;
        trials[i].target_absent_key = params.target_absent_key || 70;
        trials[i].timing_max_search = (typeof params.timing_max_search === 'undefined') ? -1 : params.timing_max_search;
        trials[i].timing_fixation = (typeof params.timing_fixation === 'undefined') ? 1000 : params.timing_fixation;
        trials[i].options = params.options || ['./object/dogs_08_pug_0035.png'];
      }

      return trials;
    };

    plugin.trial = function(display_element, trial) {

      trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

      // screen information
      var screenw = display_element.width();
      var screenh = display_element.height();
      var centerx = screenw / 2;
      var centery = screenh / 2;

      // circle params
      var diam = trial.circle_diameter; // pixels
      var radi = diam / 2;
      var paper_size = diam + trial.target_size[0];

      // stimuli width, height
      var stimh = trial.target_size[0];
      var stimw = trial.target_size[1];
      var hstimh = stimh / 2;
      var hstimw = stimw / 2;

      // fixation location
      var fix_loc = [Math.floor(paper_size / 2 - trial.fixation_size[0] / 2), Math.floor(paper_size / 2 - trial.fixation_size[1] / 2)];

      // possible stimulus locations on the circle
      var display_locs = [];
      var possible_display_locs = trial.set_size;
      var random_offset = Math.floor(Math.random() * 360);
      for (var i = 0; i < possible_display_locs; i++) {
        display_locs.push([
          Math.floor(paper_size / 2 + (cosd(random_offset + (i * (360 / possible_display_locs))) * radi) - hstimw),
          Math.floor(paper_size / 2 - (sind(random_offset + (i * (360 / possible_display_locs))) * radi) - hstimh)
        ]);
      }

      // get target to draw on
      display_element.append($('<svg id="jspsych-nAFC-circle-svg" width=' + paper_size + ' height=' + paper_size + '></svg>'));
      var paper = Snap('#jspsych-nAFC-circle-svg');

      show_fixation();

      function show_fixation() {
        // show fixation
        var fixation = paper.image(trial.fixation_image, fix_loc[0], fix_loc[1], trial.fixation_size[0], trial.fixation_size[1]);

        // wait
        setTimeout(function() {
          // after wait is over
          show_object_array();
        }, trial.timing_fixation);
      }

      function show_object_array() {
        var object_array_images = [];
        img = new Array;
        for (var i = 0; i < display_locs.length; i++) {
          var img = paper.image(trial.options[i], display_locs[i][0], display_locs[i][1], trial.target_size[0], trial.target_size[1]);                
          object_array_images.push(img);
        }
        var trial_over = false;

        images = paper.g(paper.selectAll('image'));

        images.selectAll('image').forEach( function( el, index ) {
           el.hover( function() { el.animate({ transform: 's1.5,1.5' }, 500, mina.easein); },
                     function() { el.animate({ transform: 's1,1' }, 500 , mina.easein); }
            )
        } );

        var after_response = function(info) {
          trial_over = true;
          var correct = 0;
          if (info.clickedObj == trial.target) {
            correct = 1;
          }
          clear_display();
          end_trial(info.rt, correct, info.clickedObj); // todo: define rt/clickedObj
        }


      function clear_display() {
        paper.clear();
      }

      }




      function end_trial(rt, correct, key_press) {

        // data saving
        var trial_data = {
          correct: correct,
          rt: rt,
          locations: JSON.stringify(display_locs),
          sketch: trial.sketch,
          target: trial.target

        };

        // this line merges together the trial_data object and the generic
        // data object (trial.data), and then stores them.
        jsPsych.data.write(trial_data);

        // go to next trial
        jsPsych.finishTrial();
      }
    };

    // helper function for determining stimulus locations

    function cosd(num) {
      return Math.cos(num / 180 * Math.PI);
    }

    function sind(num) {
      return Math.sin(num / 180 * Math.PI);
    }

    return plugin;
  })();
})(jQuery);
