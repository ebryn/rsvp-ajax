RSVP.ajax = {
  _ajax: function(url, type, params, data) {
    var promise = new Ember.RSVP.Promise(),
        xhr = new XMLHttpRequest();

    if (params) { url = url + '?' + $.param(params); }

    xhr.onreadystatechange = function(event) {
      /*
        https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest

        0 UNSENT  open()has not been called yet.
        1 OPENED  send()has not been called yet.
        2 HEADERS_RECEIVED  send() has been called, and headers and status are available.
        3 LOADING Downloading; responseText holds partial data.
        4 DONE  The operation is complete.
      */

      if (xhr.readyState < 2) { return; }
      if (xhr.status !== 200) { promise.reject(xhr); return; }
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.time('onreadystatechange: ' + url);
        Ember.run(promise, promise.resolve, xhr.responseText);
        console.timeEnd('onreadystatechange: ' + url);
      }
    };
    xhr.open(type, url, true);
    if (data) {
      xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      if (!(data instanceof FormData) && typeof data === 'object') { data = $.param(data); }
      xhr.send(data);
    } else {
      xhr.send();
    }

    return promise;
  },

  get: function(url, params) {
    return this._ajax(url, 'GET', params);
  },

  getJSON: function(url, params) {
    var promise = new Ember.RSVP.Promise();

    this.get(url, params).then(function(responseText) {
      console.time('JSON.parse: ' + url);
      var data = JSON.parse(responseText);
      console.timeEnd('JSON.parse: ' + url);
      promise.resolve(data);
    }, function() {
      promise.reject.apply(promise, arguments);
    });

    return promise;
  },

  post: function(url, data) {
    var promise = new Ember.RSVP.Promise(),
        request = this._ajax(url, 'POST', undefined, data);

    request.then(function(responseText) {
      console.time('JSON.parse: ' + url);
      var data = JSON.parse(responseText);
      console.timeEnd('JSON.parse: ' + url);
      promise.resolve(data);
    }, function() {
      promise.reject.apply(promise, arguments);
    });

    return promise;
  },

  'delete': function(url) {
    return this._ajax(url, 'DELETE');
  }
};