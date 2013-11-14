/*
Copyright 2013 Eiji Kitamura

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Author: Eiji Kitamura (agektmr@gmail.com)
*/
'use strict';

app.factory('Quota', ['FileSystem', '$window', function(fs, $window) {
  var temporaryStorage =  $window.navigator.temporaryStorage ||
                          $window.navigator.webkitTemporaryStorage ||
                          $window.navigator.mozTemporaryStorage ||
                          $window.navigator.msTemporaryStorage ||
                          undefined;
  var persistentStorage = $window.navigator.persistentStorage ||
                          $window.navigator.webkitPersistentStorage ||
                          $window.navigator.mozPersistentStorage ||
                          $window.navigator.msPersistentStorage ||
                          undefined;

  var error = function(e) {
    alert('Error!', e);
    console.error('Quota Management Error', e);
    console.trace();
  };

  var Quota = function() {
    this.usage = 0;
    this.quota = 0;
    this.disp_usage = 0;
    this.disp_quota = 0;
    this.storage_type = 'TEMPORARY';
    this.storage = null;
    this.supported = false;
    this.oncomplete = null;
    if (!temporaryStorage || !persistentStorage) {
      console.error('Quota Management API not supported on this browser');
      return;
    }
    this.supported = true;
    this.storage = this.storage_type === 'TEMPORARY' ? temporaryStorage : persistentStorage;
    this.request_usage();
  };
  Quota.prototype = {
    change_file_system: function() {
      if (!this.supported) return;
      this.storage = this.storage_type === 'TEMPORARY' ? temporaryStorage : persistentStorage;
      fs.open(this.storage, this.quota);
      this.request_usage();
    },
    request_quota: function(callback) {
      if (!this.supported) return;
      this.storage.requestQuota(this.disp_quota * 1024 * 1024, (function(quota) {
        this.quota = quota;
        this.disp_quota = ~~(quota / 1024 / 1024);
        this.change_file_system();
      }).bind(this), error);
    },
    request_usage: function() {
      if (!this.supported) return;
      this.storage.queryUsageAndQuota((function(usage, quota) {
        this.quota = quota;
        this.usage = usage;
        this.disp_quota = ~~(quota / 1024 / 1024);
        this.disp_usage = ~~(usage / 1024 / 1024);
        if (typeof this.oncomplete === 'function') this.oncomplete();
      }).bind(this), error);
    }
  };
  return new Quota();
}]);
