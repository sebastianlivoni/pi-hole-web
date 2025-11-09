/**
 * Pi-hole patches for daterangepicker
 * 
 * This file contains patches applied to the daterangepicker library
 * to make it compatible with Pi-hole's requirements.
 * 
 * Load this file AFTER daterangepicker.min.js
 * 
 * Patches:
 * - Fixed calculateChosenLabel() chained equality bug that caused "Custom Range" 
 *   to always be highlighted even when a predefined range was selected.
 *   
 *   Upstream PR: https://github.com/Wernfried/daterangepicker/pull/1
 */

(function() {
  'use strict';
  
  // Wait for jQuery and daterangepicker to be available
  if (typeof jQuery === 'undefined' || !jQuery.fn.daterangepicker) {
    console.error('Pi-hole daterangepicker patches: jQuery or daterangepicker not loaded');
    return;
  }

  // Patch the calculateChosenLabel method in the DateRangePicker constructor's prototype
  // We need to intercept during initialization to patch the instance
  const originalDateRangePicker = jQuery.fn.daterangepicker;
  
  jQuery.fn.daterangepicker = function(options, callback) {
    // Call the original constructor
    const result = originalDateRangePicker.call(this, options, callback);
    
    // Get the daterangepicker instance
    const picker = this.data('daterangepicker');
    
    if (picker && picker.calculateChosenLabel) {
      
      // Replace with patched version
      picker.calculateChosenLabel = function() {
        // If selected range from calendar matches any custom range, then highlight it
        var customRange = true;
        var i = 0;
        for (var range in this.ranges) {
          var unit = this.timePicker ? 'hour' : 'day';
          if (this.timePicker) {
            if (this.timePickerOpts.showMinutes) {
              unit = 'minute';
            } else if (this.timePickerOpts.showSeconds) {
              unit = 'second';
            }
          }
          // PATCHED: Use .equals() and && instead of chained ==
          if (this.startDate.startOf(unit).equals(this.ranges[range][0].startOf(unit)) && 
              this.endDate.startOf(unit).equals(this.ranges[range][1].startOf(unit))) {
          // END PATCH
            customRange = false;
            this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')').addClass('active').attr('data-range-key');
            break;
          }
          i++;
        }
        if (customRange) {
          if (this.showCustomRangeLabel) {
            this.chosenLabel = this.container.find('.ranges li:last').addClass('active').attr('data-range-key');
          } else {
            this.chosenLabel = null;
          }
          this.showCalendars();
        }
      };
    }
    
    return result;
  };
  
  // Copy over any properties from the original function
  jQuery.fn.daterangepicker.defaultOptions = originalDateRangePicker.defaultOptions;
  
  console.log('Pi-hole daterangepicker patches applied');
  
})();
