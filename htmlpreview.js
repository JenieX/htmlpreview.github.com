(function () {
  var previewForm = document.getElementById('previewform');

  var url = location.search
    .substring(1)
    // .replace(/\/\/github\.com/, '//raw.githubusercontent.com')
    .replace(/\/blob\//, '/raw/refs/heads/');

  console.log({ url });

  var replaceAssets = function () {
    var frame,
      a,
      link,
      links = [],
      script,
      scripts = [],
      i,
      href,
      src;
    //Framesets
    if (document.querySelectorAll('frameset').length) return; //Don't replace CSS/JS if it's a frameset, because it will be erased by document.write()
    //Frames
    frame = document.querySelectorAll('iframe[src],frame[src]');
    for (i = 0; i < frame.length; ++i) {
      src = frame[i].src; //Get absolute URL
      if (src.indexOf('//raw.githubusercontent.com') > 0 || src.indexOf('//bitbucket.org') > 0) {
        //Check if it's from raw.github.com or bitbucket.org
        frame[i].src = '//' + location.hostname + location.pathname + '?' + src; //Then rewrite URL so it can be loaded using CORS proxy
      }
    }
    //Links
    a = document.querySelectorAll('a[href]');
    for (i = 0; i < a.length; ++i) {
      href = a[i].href; //Get absolute URL
      if (href.indexOf('#') > 0) {
        //Check if it's an anchor
        a[i].href =
          '//' +
          location.hostname +
          location.pathname +
          location.search +
          '#' +
          a[i].hash.substring(1); //Then rewrite URL with support for empty anchor
      } else if (
        (href.indexOf('//raw.githubusercontent.com') > 0 || href.indexOf('//bitbucket.org') > 0) &&
        (href.indexOf('.html') > 0 || href.indexOf('.htm') > 0)
      ) {
        //Check if it's from raw.github.com or bitbucket.org and to HTML files
        a[i].href = '//' + location.hostname + location.pathname + '?' + href; //Then rewrite URL so it can be loaded using CORS proxy
      }
    }
    //Stylesheets
    link = document.querySelectorAll('link[rel=stylesheet]');
    for (i = 0; i < link.length; ++i) {
      href = link[i].href; //Get absolute URL
      if (href.indexOf('//raw.githubusercontent.com') > 0 || href.indexOf('//bitbucket.org') > 0) {
        //Check if it's from raw.github.com or bitbucket.org
        links.push(fetchProxy(href, null, 0)); //Then add it to links queue and fetch using CORS proxy
      }
    }
    Promise.all(links).then(function (res) {
      for (i = 0; i < res.length; ++i) {
        loadCSS(res[i]);
      }
    });
    //Scripts
    script = document.querySelectorAll('script[type="text/htmlpreview"]');
    for (i = 0; i < script.length; ++i) {
      src = script[i].src; //Get absolute URL
      if (src.indexOf('//raw.githubusercontent.com') > 0 || src.indexOf('//bitbucket.org') > 0) {
        //Check if it's from raw.github.com or bitbucket.org
        scripts.push(fetchProxy(src, null, 0)); //Then add it to scripts queue and fetch using CORS proxy
      } else {
        script[i].removeAttribute('type');
        scripts.push(script[i].innerHTML); //Add inline script to queue to eval in order
      }
    }
    Promise.all(scripts).then(function (res) {
      for (i = 0; i < res.length; ++i) {
        loadJS(res[i]);
      }
      document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true })); //Dispatch DOMContentLoaded event after loading all scripts
    });
  };

  var loadHTML = function (data) {
    if (data) {
      data = data
        .replace(/<head([^>]*)>/i, '<head$1><base href="' + url + '">')
        .replace(
          /<script(\s*src=["'][^"']*["'])?(\s*type=["'](text|application)\/javascript["'])?/gi,
          '<script type="text/htmlpreview"$1'
        ); //Add <base> just after <head> and replace <script type="text/javascript"> with <script type="text/htmlpreview">
      setTimeout(function () {
        document.open();
        document.write(data);
        document.close();
        replaceAssets();
      }, 10); //Delay updating document to have it cleared before
    }
  };

  var loadCSS = function (data) {
    if (data) {
      var style = document.createElement('style');
      style.innerHTML = data;
      document.head.appendChild(style);
    }
  };

  var loadJS = function (data) {
    if (data) {
      var script = document.createElement('script');
      script.innerHTML = data;
      document.body.appendChild(script);
    }
  };

  var fetchProxy = function (url, options, i) {
    var proxy = [
      '', // try without proxy first
      // 'https://api.codetabs.com/v1/proxy/?quest='
    ];
    return fetch(proxy[i] + url, options)
      .then(function (res) {
        if (!res.ok)
          throw new Error('Cannot load ' + url + ': ' + res.status + ' ' + res.statusText);
        return res.text();
      })
      .catch(function (error) {
        if (i === proxy.length - 1) throw error;
        return fetchProxy(url, options, i + 1);
      });
  };

  if (url && url.indexOf(location.hostname) < 0)
    fetchProxy(url, { method: 'GET', credentials: 'include' }, 0)
      .then(loadHTML)
      .catch(function (error) {
        console.error(error);
        previewForm.style.display = 'block';
        previewForm.innerText = error;
      });
  else previewForm.style.display = 'block';
})();

fetch('https://github.com/JenieX/gitmoji-lite/raw/refs/heads/main/index.html', {
  headers: {
    accept: '*/*',
    'accept-language': 'en-US,en;q=0.9,ar;q=0.8,ru;q=0.7,de;q=0.6,it;q=0.5,cy;q=0.4',
    'cache-control': 'no-cache',
    pragma: 'no-cache',
    'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Microsoft Edge";v="108"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    cookie:
      'tz=Asia%2FRiyadh; tz=Asia%2FRiyadh; preferred_color_mode=dark; color_mode=%7B%22color_mode%22%3A%22dark%22%2C%22light_theme%22%3A%7B%22name%22%3A%22light%22%2C%22color_mode%22%3A%22light%22%7D%2C%22dark_theme%22%3A%7B%22name%22%3A%22dark%22%2C%22color_mode%22%3A%22dark%22%7D%7D; _device_id=d8a4138c18dfff9ba042f8fe2cf7dc56; cpu_bucket=xlg; GHCC=Required:1-Analytics:1-SocialMedia:1-Advertising:1; MicrosoftApplicationsTelemetryDeviceId=598b8471-2b8d-4612-9d2a-861b51101b0a; saved_user_sessions=102888858%3AcDU6yYXBxIeJVMc3--gxQrYq1H8WLRpq_X22Uv5GAexXwcZc; user_session=cDU6yYXBxIeJVMc3--gxQrYq1H8WLRpq_X22Uv5GAexXwcZc; __Host-user_session_same_site=cDU6yYXBxIeJVMc3--gxQrYq1H8WLRpq_X22Uv5GAexXwcZc; logged_in=yes; dotcom_user=JenieX; _octo=GH1.1.303981178.1746380737; _gh_sess=4uWz9l2BywS1whEvYeh9puKj4GrYPb9%2FQVrqYstfvZqsJlUVYDnTtNPFpnxs22YBIEuslgzF%2Bz9lKkjGFUYalW8pZPgN%2FMzajFZKGzrJkP6dES2a7A%2Bd189yVLHd6UcNqTLs6S2XvpmkDDiOEybDvOmMDwPbAdgFaJEwMy3WW%2Ba851OLd0g7tpVHpsKRsUNzUhdU1eqool1Wq%2BW8R8zz507TZIK37APw0%2F7%2By5bdZ6IJwW05tuSo3WBENCFNxKfF9TWX1CdkZqzsQNlhHI%2BIcAmEzB8SWMnxglntezmZ0OkRFKADz9jsqYbfn%2FYAVXlqclL%2B4afDywDwGRefrRiS%2F7YNg%2FLbDq7tAyw4a5WUHifXRNIZk4aul8RUUIrZi2EkrriJWD9kTdhq8DxTy0fO4z13ORsN4nufaByR0DxcRLY%2BWs7AOgGzg7JsAEPI9%2F9B96M1WDnoKF%2BUtNyp2Zg55PrzRhOHdYBrrtk9d6XPDYXjNcrVHNa5RKzuePtsL%2B4Jc9qTztZgUIk%3D--aho95DXuQil2EMEI--rAAAe1gqfPRwzUwhY2L7%2BQ%3D%3D',
    Referer: 'https://jeniex.github.io/',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
  body: null,
  method: 'GET',
  redirect: 'follow',
});

let request = new XMLHttpRequest();
request.onreadystatechange = function () {
  if (this.readyState === 4) {
    if (this.status === 200) {
      document.body.className = 'ok';
      console.log(this.responseText);
    } else if (this.response == null && this.status === 0) {
      document.body.className = 'error offline';
      console.log('The computer appears to be offline.');
    } else {
      document.body.className = 'error';
    }
  }
};
request.withCredentials = true;
request.open('GET', 'https://github.com/JenieX/gitmoji-lite/raw/refs/heads/main/index.html', true);
request.send(null);
