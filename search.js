// After the API loads, call a function to enable the search box.
function handleAPILoaded() {
  $('#search-button').attr('disabled', false);
}
function formulatePage(list){
  var html = "",
      video_urls = [];
  html += "<div class='playlists'>";
  _.each(_.keys(list), function(key){
    html += key;
    html += "<br>";
  }, this);
  html += "</div><br><br>";
  _.each(_.keys(list), function(key){
    html += "<div class='class_item'>";
    html +=   "<div class='heading'>"+key+"</div>";
    html +=   "<div class='video_set'>";
    html +=   "<ul>";
    _.each(list[key], function (item){
        //html += "<li>";
        //html += "<div class='video_item'>"+item.title+"<br>"+ item.description+ "</div>";
        //html += "</li>";
        video_urls.push(item.url);
    }, this);
      html += "</ul>";
      html += "</div>";
    html +=   "<div class='url_list'>";
    _.each(video_urls, function (item){
      html += "<li>";
      html += item;
      html += "</li>";
    }, this);
    video_urls = [];
    html +=   "</div>";
    html += "</div>";
  }, this);

  return html;
}
// Search for a specified string.
function search() {
  var q = $('#query').val();
  //var request = gapi.client.youtube.search.list({
  //
  //  q: q,
  //  part: 'snippet'
  //});
  var request = gapi.client.youtube.channels.list({
    id: q,
    part: 'snippet'
  });
  request.execute(function (result) {
    var g_channelId, g_playlistIds = [], g_playlistObjs = {};
    $.ajax({
      type: 'get',
      url: "https://www.googleapis.com/youtube/v3/channels?part=snippet&key= AIzaSyBn3atIDSgmLxcxAw9LzvFB9nUnPl_FuXU&forUsername=" + q,
      dataType: 'json',
      success: function (channel) {
        // Set Channel Id
        g_channelId = channel.items[0].id;
        //console.log("channel Id="+g_channelId);
        $.ajax({
          type: "get",
          url: "https://www.googleapis.com/youtube/v3/playlists?part=snippet&maxResults=50&key= AIzaSyBn3atIDSgmLxcxAw9LzvFB9nUnPl_FuXU&channelId=" + g_channelId,
          dataType: 'json',
          success: function (playlists) {
            // set playlist Ids
            _.each(playlists.items, function (playlist) {
              g_playlistIds.push(grabPlaylistId(playlist));
            }, this);
            var token = playlists.nextPageToken;
            while (g_playlistIds.length < playlists.pageInfo.totalResults) {
              //while(!_.isUndefined(playlist.nextPageToken)){
              var url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet&maxResults=50" +
                  "&key= AIzaSyBn3atIDSgmLxcxAw9LzvFB9nUnPl_FuXU&channelId=" + g_channelId + "&pageToken=" + token;
              $.ajax({
                type: "get",
                url: url,
                dataType: 'json',
                success: function (a) {
                  // set playlist Ids
                  token = a.nextPageToken;
                  _.each(a.items, function (playlist) {
                    //console.log("playlistId="+playlist.id);
                    g_playlistIds.push(grabPlaylistId(playlist));
                  }, this);
                },
                async: false
              });
            }
            g_playlistObjs = convertIdsToPlaylistObj(g_playlistIds);
          },
          async: false
        });
      },
      async: false
    });
    debugger;
    //var str = JSON.stringify(g_playlistObjs, null, ' \t');
    var str = formulatePage(g_playlistObjs);

    console.log(str);
    $('#search-container').html(str);
  });

  function grabPlaylistId(playlist) {
    return {playlist_name: playlist.snippet.title, id: playlist.id, snippet: playlist.snippet};
  }

  function convertIdsToPlaylistObj(playlistIds) {
    var videos = [], courseList = {};

    _.each(playlistIds, function (playlist) {
      var name = playlist.playlist_name;
      videos = [];
      $.when($.ajax({
        type: "get",
        url: "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&key= AIzaSyBn3atIDSgmLxcxAw9LzvFB9nUnPl_FuXU&playlistId=" + playlist.id,
        dataType: 'json',
        success: function (items) {
          // grab each video
        },
        async: false
      })).then(function (result) {
        if (result.pageInfo.totalResults !== result.items.length) {
          //TODO: Get all the videos
        }
        _.each(result.items, function (item) {
          //console.log("item=" + item.snippet.title);
          videos.push({
            videoId: item.id,
            url: "https://www.youtube.com/watch?v=" + item.snippet.resourceId.videoId,
            title: item.snippet.title,
            description: item.snippet.description
          });
        }, this);
        courseList[name] = _.clone(videos);
      });
    }, this);
    return courseList;
  }
}
//  request.execute(function(response) {
//    var g_channelId, g_playlistIds = [], g_playlistObjs = {};
//    $.when(
//      $.ajax({
//        type: 'get',
//        url: "https://www.googleapis.com/youtube/v3/channels?part=snippet&key= AIzaSyBn3atIDSgmLxcxAw9LzvFB9nUnPl_FuXU&forUsername=" + q,
//        dataType: 'json',
//        success: function(channel){
//          // Set Channel Id
//          g_channelId = channel.items[0].id;
//          //console.log("channel Id="+g_channelId);
//        },
//        async: false
//      })
//    ).then(function (data){
//        $.ajax({
//          type: "get",
//          url: "https://www.googleapis.com/youtube/v3/playlists?part=snippet&maxResults=50&key= AIzaSyBn3atIDSgmLxcxAw9LzvFB9nUnPl_FuXU&channelId=" + g_channelId,
//          dataType: 'json',
//          success: function (playlists) {
//            // set playlist Ids
//            //TODO: Refactor
//            _.each(playlists.items, function (playlist){
//              g_playlistIds.push(grabPlaylistId(playlist));
//            }, this);
//            debugger;
//            var token = playlists.nextPageToken;
//            while(g_playlistIds.length < playlists.pageInfo.totalResults) {
//              //while(!_.isUndefined(playlist.nextPageToken)){
//              var url =  "https://www.googleapis.com/youtube/v3/playlists?part=snippet&maxResults=50"+
//                  "&key= AIzaSyBn3atIDSgmLxcxAw9LzvFB9nUnPl_FuXU&channelId=" + g_channelId + "&pageToken="+token;
//              $.ajax({
//                type: "get",
//                url:url,
//                dataType: 'json',
//                success: function (a) {
//                  // set playlist Ids
//                  token = a.nextPageToken;
//                  _.each(a.items, function (playlist) {
//                    //console.log("playlistId="+playlist.id);
//                    g_playlistIds.push(grabPlaylistId(playlist));
//                  }, this);
//                },
//                async: false
//              });
//            }
//
//            g_playlistObjs = convertIdsToPlaylistObj(g_playlistIds);
//          },
//          async: false
//        });
//    });
//    debugger;
//    var str = JSON.stringify(g_playlistObjs, null, ' \t');
//
//    console.log(str);
//    $('#search-container').html(str);
//  });
//}




// notes


/**
 * Get Channel
 * GET https://www.googleapis.com/youtube/v3/channels?part=snippet&key= AIzaSyBn3atIDSgmLxcxAw9LzvFB9nUnPl_FuXU&forUsername=MIT
 *
 * {
  "kind": "youtube#channelListResponse",
  "etag": "\"CuSCwMPVmgi8taDtE2LV6HdgkN0/Munyc83svaEYihnb5lKiZpRK0JI\"",
  "pageInfo": {
    "totalResults": 1,
    "resultsPerPage": 5
  },
  "items": [
    {
      "kind": "youtube#channel",
      "etag": "\"CuSCwMPVmgi8taDtE2LV6HdgkN0/1CL28yHZZgPr7ojFhkQyu0AfJWo\"",
      "id": "UCEBb1b_L6zDS3xTUrIALZOw",
      "snippet": {
        "title": "MIT OpenCourseWare",
        "description": "The mission of MIT is to advance knowledge and educate students in science, technology, and other areas of scholarship that will best serve the nation and the world in the 21st century.\n\nThe Institute is committed to generating, disseminating, and preserving knowledge, and to working with others to bring this knowledge to bear on the world's great challenges. MIT is dedicated to providing its students with an education that combines rigorous academic study and the excitement of discovery with the support and intellectual stimulation of a diverse campus community. We seek to develop in each member of the MIT community the ability and passion to work wisely, creatively, and effectively for the betterment of humankind.\n\nChannel banner photo by Ali Almossawi (http://www.flickr.com/photos/usr_c/5633432466/).",
        "customUrl": "MITOCW",
        "publishedAt": "2005-10-11T09:36:14.000Z",
        "thumbnails": {
          "default": {
            "url": "https://yt3.ggpht.com/-R20NMGble7Q/AAAAAAAAAAI/AAAAAAAAAAA/jtkvXd3lm7o/s88-c-k-no-rj-c0xffffff/photo.jpg"
          },
          "medium": {
            "url": "https://yt3.ggpht.com/-R20NMGble7Q/AAAAAAAAAAI/AAAAAAAAAAA/jtkvXd3lm7o/s240-c-k-no-rj-c0xffffff/photo.jpg"
          },
          "high": {
            "url": "https://yt3.ggpht.com/-R20NMGble7Q/AAAAAAAAAAI/AAAAAAAAAAA/jtkvXd3lm7o/s240-c-k-no-rj-c0xffffff/photo.jpg"
          }
        },
        "localized": {
          "title": "MIT OpenCourseWare",
          "description": "The mission of MIT is to advance knowledge and educate students in science, technology, and other areas of scholarship that will best serve the nation and the world in the 21st century.\n\nThe Institute is committed to generating, disseminating, and preserving knowledge, and to working with others to bring this knowledge to bear on the world's great challenges. MIT is dedicated to providing its students with an education that combines rigorous academic study and the excitement of discovery with the support and intellectual stimulation of a diverse campus community. We seek to develop in each member of the MIT community the ability and passion to work wisely, creatively, and effectively for the betterment of humankind.\n\nChannel banner photo by Ali Almossawi (http://www.flickr.com/photos/usr_c/5633432466/)."
        }
      }
    }
  ]
}
 *
 *
 * Get Playlists from channel
 * GET https://www.googleapis.com/youtube/v3/playlists?part=snippet&key= AIzaSyBn3atIDSgmLxcxAw9LzvFB9nUnPl_FuXU&channelId=UCEBb1b_L6zDS3xTUrIALZOw
 *
 * {
  "kind": "youtube#playlistListResponse",
  "etag": "\"CuSCwMPVmgi8taDtE2LV6HdgkN0/ESfo147rX4Awdhi4hD-P1hpOSBQ\"",
  "nextPageToken": "CAUQAA",
  "pageInfo": {
    "totalResults": 191,
    "resultsPerPage": 5
  },
  "items": [
    {
      "kind": "youtube#playlist",
      "etag": "\"CuSCwMPVmgi8taDtE2LV6HdgkN0/MX2OqzA2N07hSEgCuIBOI55NLkI\"",
      "id": "PLUl4u3cNGP60ONw6Q81tS64qKRUJ9nwq8",
      "snippet": {
        "publishedAt": "2016-02-09T19:39:10.000Z",
        "channelId": "UCEBb1b_L6zDS3xTUrIALZOw",
        "title": "How We Teach: MIT 6.046J Design and Analysis of Algorithms, Spring 2015",
        "description": "",
        "thumbnails": {
          "default": {
            "url": "https://i.ytimg.com/vi/U4x-hzhohB8/default.jpg",
            "width": 120,
            "height": 90
          },
          "medium": {
            "url": "https://i.ytimg.com/vi/U4x-hzhohB8/mqdefault.jpg",
            "width": 320,
            "height": 180
          },
          "high": {
            "url": "https://i.ytimg.com/vi/U4x-hzhohB8/hqdefault.jpg",
            "width": 480,
            "height": 360
          }
        },
        "channelTitle": "MIT OpenCourseWare",
        "localized": {
          "title": "How We Teach: MIT 6.046J Design and Analysis of Algorithms, Spring 2015",
          "description": ""
        }
      }
    },
    {
      "kind": "youtube#playlist",
      "etag": "\"CuSCwMPVmgi8taDtE2LV6HdgkN0/ylrI5llAr6yACbw_dliBpTCBBcE\"",
      "id": "PLUl4u3cNGP63wurgwdJKo6UEYBWDLnmCj",
      "snippet": {
        "publishedAt": "2016-02-09T16:20:05.000Z",
        "channelId": "UCEBb1b_L6zDS3xTUrIALZOw",
        "title": "MIT 21L.011 The Film Experience, Fall 2013",
        "description": "View the complete course: http://ocw.mit.edu/21L-011F13\nInstructor: David Thorburn\n\nThis complete set of lecture videos provides a close analysis and criticism of a wide range of films, from the early silent period, classic Hollywood genres including musicals, thrillers and westerns, and European and Japanese art cinema.\n\nLicense: Creative Commons BY-NC-SA\nMore information at http://ocw.mit.edu/terms\nMore courses at http://ocw.mit.edu",
        "thumbnails": {
          "default": {
            "url": "https://i.ytimg.com/vi/LFOsw1Vccac/default.jpg",
            "width": 120,
            "height": 90
          },
          "medium": {
            "url": "https://i.ytimg.com/vi/LFOsw1Vccac/mqdefault.jpg",
            "width": 320,
            "height": 180
          },
          "high": {
            "url": "https://i.ytimg.com/vi/LFOsw1Vccac/hqdefault.jpg",
            "width": 480,
            "height": 360
          }
        },
        "channelTitle": "MIT OpenCourseWare",
        "localized": {
          "title": "MIT 21L.011 The Film Experience, Fall 2013",
          "description": "View the complete course: http://ocw.mit.edu/21L-011F13\nInstructor: David Thorburn\n\nThis complete set of lecture videos provides a close analysis and criticism of a wide range of films, from the early silent period, classic Hollywood genres including musicals, thrillers and westerns, and European and Japanese art cinema.\n\nLicense: Creative Commons BY-NC-SA\nMore information at http://ocw.mit.edu/terms\nMore courses at http://ocw.mit.edu"
        }
      }
    },
    {
      "kind": "youtube#playlist",
      "etag": "\"CuSCwMPVmgi8taDtE2LV6HdgkN0/qvKCtJFCMzAT3G7R7STVHVlnIDw\"",
      "id": "PLUl4u3cNGP633VWvZh23bP6dG80gW34SU",
      "snippet": {
        "publishedAt": "2016-02-01T19:13:43.000Z",
        "channelId": "UCEBb1b_L6zDS3xTUrIALZOw",
        "title": "MIT 8.821 String Theory and Holographic Duality, Fall 2014",
        "description": "View the complete course: http://ocw.mit.edu/8-821F14\nInstructor: Hong Liu\n\nThis course covers the new field of Holographic Duality, which brings together many seemingly unconnected subjects including string theory/quantum gravity, black holes, QCD at extreme conditions, exotic condensed matter systems, and quantum information.\n\nLicense: Creative Commons BY-NC-SA\nMore information at http://ocw.mit.edu/terms\nMore courses at http://ocw.mit.edu",
        "thumbnails": {
          "default": {
            "url": "https://i.ytimg.com/vi/EUnGZoBa3nc/default.jpg",
            "width": 120,
            "height": 90
          },
          "medium": {
            "url": "https://i.ytimg.com/vi/EUnGZoBa3nc/mqdefault.jpg",
            "width": 320,
            "height": 180
          },
          "high": {
            "url": "https://i.ytimg.com/vi/EUnGZoBa3nc/hqdefault.jpg",
            "width": 480,
            "height": 360
          }
        },
        "channelTitle": "MIT OpenCourseWare",
        "localized": {
          "title": "MIT 8.821 String Theory and Holographic Duality, Fall 2014",
          "description": "View the complete course: http://ocw.mit.edu/8-821F14\nInstructor: Hong Liu\n\nThis course covers the new field of Holographic Duality, which brings together many seemingly unconnected subjects including string theory/quantum gravity, black holes, QCD at extreme conditions, exotic condensed matter systems, and quantum information.\n\nLicense: Creative Commons BY-NC-SA\nMore information at http://ocw.mit.edu/terms\nMore courses at http://ocw.mit.edu"
        }
      }
    },
    {
      "kind": "youtube#playlist",
      "etag": "\"CuSCwMPVmgi8taDtE2LV6HdgkN0/U4BssWL4s097S-ciWs2-czNYTNc\"",
      "id": "PLUl4u3cNGP6317WaSNfmCvGym2ucw3oGp",
      "snippet": {
        "publishedAt": "2016-01-22T20:39:37.000Z",
        "channelId": "UCEBb1b_L6zDS3xTUrIALZOw",
        "title": "MIT 6.046J Design and Analysis of Algorithms, Spring 2015",
        "description": "View the complete course: http://ocw.mit.edu/6-046JS15\nInstructors: Erik Demaine, Srinivas Devadas, Nancy Ann Lynch\n\n6.046 introduces students to the design of computer algorithms, as well as analysis of sophisticated algorithms.\n\nLicense: Creative Commons BY-NC-SA\nMore information at http://ocw.mit.edu/terms\nMore courses at http://ocw.mit.edu",
        "thumbnails": {
          "default": {
            "url": "https://i.ytimg.com/vi/2P-yW7LQr08/default.jpg",
            "width": 120,
            "height": 90
          },
          "medium": {
            "url": "https://i.ytimg.com/vi/2P-yW7LQr08/mqdefault.jpg",
            "width": 320,
            "height": 180
          },
          "high": {
            "url": "https://i.ytimg.com/vi/2P-yW7LQr08/hqdefault.jpg",
            "width": 480,
            "height": 360
          }
        },
        "channelTitle": "MIT OpenCourseWare",
        "localized": {
          "title": "MIT 6.046J Design and Analysis of Algorithms, Spring 2015",
          "description": "View the complete course: http://ocw.mit.edu/6-046JS15\nInstructors: Erik Demaine, Srinivas Devadas, Nancy Ann Lynch\n\n6.046 introduces students to the design of computer algorithms, as well as analysis of sophisticated algorithms.\n\nLicense: Creative Commons BY-NC-SA\nMore information at http://ocw.mit.edu/terms\nMore courses at http://ocw.mit.edu"
        }
      }
    },
    {
      "kind": "youtube#playlist",
      "etag": "\"CuSCwMPVmgi8taDtE2LV6HdgkN0/JBsfOHZ-5xr17KE-F57f68MMUgI\"",
      "id": "PLUl4u3cNGP63xToz7GWDscvz1snleEGy-",
      "snippet": {
        "publishedAt": "2015-12-29T19:07:26.000Z",
        "channelId": "UCEBb1b_L6zDS3xTUrIALZOw",
        "title": "MIT CMS.701, Spring 2015",
        "description": "MIT CMS.701 Current Debates in Media, Spring 2015\nView the complete course: http://ocw.mit.edu/CMS-701S15\nInstructor: Sebastian Deterding, Gabrielle Trepanier Jobin\n\nLicense: Creative Commons BY-NC-SA\nMore information at http://ocw.mit.edu/terms\nMore courses at http://ocw.mit.edu",
        "thumbnails": {
          "default": {
            "url": "https://i.ytimg.com/vi/oCk2LZwRU0s/default.jpg",
            "width": 120,
            "height": 90
          },
          "medium": {
            "url": "https://i.ytimg.com/vi/oCk2LZwRU0s/mqdefault.jpg",
            "width": 320,
            "height": 180
          },
          "high": {
            "url": "https://i.ytimg.com/vi/oCk2LZwRU0s/hqdefault.jpg",
            "width": 480,
            "height": 360
          }
        },
        "channelTitle": "MIT OpenCourseWare",
        "localized": {
          "title": "MIT CMS.701, Spring 2015",
          "description": "MIT CMS.701 Current Debates in Media, Spring 2015\nView the complete course: http://ocw.mit.edu/CMS-701S15\nInstructor: Sebastian Deterding, Gabrielle Trepanier Jobin\n\nLicense: Creative Commons BY-NC-SA\nMore information at http://ocw.mit.edu/terms\nMore courses at http://ocw.mit.edu"
        }
      }
    }
  ]
}
 *
 *
 *
 *
 *
 *
 * GET Playlist Items
 * GET https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&key= AIzaSyBn3atIDSgmLxcxAw9LzvFB9nUnPl_FuXU&playlistId=PLUl4u3cNGP6317WaSNfmCvGym2ucw3oGp
 * {
  "kind": "youtube#playlistItemListResponse",
  "etag": "\"CuSCwMPVmgi8taDtE2LV6HdgkN0/59TbrjBVasdZQcRSKMRBuW5wLzo\"",
  "nextPageToken": "CAUQAA",
  "pageInfo": {
    "totalResults": 34,
    "resultsPerPage": 5
  },
  "items": [
    {
      "kind": "youtube#playlistItem",
      "etag": "\"CuSCwMPVmgi8taDtE2LV6HdgkN0/RLtGgI7jAijAg2T98VGomgaNJlQ\"",
      "id": "UExVbDR1M2NOR1A2MzE3V2FTTmZtQ3ZHeW0ydWN3M29HcC4zRjM0MkVCRTg0MkYyQTM0",
      "snippet": {
        "publishedAt": "2016-01-22T21:28:14.000Z",
        "channelId": "UCEBb1b_L6zDS3xTUrIALZOw",
        "title": "1. Course Overview, Interval Scheduling",
        "description": "MIT 6.046J Design and Analysis of Algorithms, Spring 2015\nView the complete course: http://ocw.mit.edu/6-046JS15\nInstructor: Srinivas Devadas\n\nIn this lecture, Professor Devadas gives an overview of the course and introduces an algorithm for optimal interval scheduling.\n\nLicense: Creative Commons BY-NC-SA\nMore information at http://ocw.mit.edu/terms\nMore courses at http://ocw.mit.edu",
        "thumbnails": {
          "default": {
            "url": "https://i.ytimg.com/vi/2P-yW7LQr08/default.jpg",
            "width": 120,
            "height": 90
          },
          "medium": {
            "url": "https://i.ytimg.com/vi/2P-yW7LQr08/mqdefault.jpg",
            "width": 320,
            "height": 180
          },
          "high": {
            "url": "https://i.ytimg.com/vi/2P-yW7LQr08/hqdefault.jpg",
            "width": 480,
            "height": 360
          }
        },
        "channelTitle": "MIT OpenCourseWare",
        "playlistId": "PLUl4u3cNGP6317WaSNfmCvGym2ucw3oGp",
        "position": 0,
        "resourceId": {
          "kind": "youtube#video",
          "videoId": "2P-yW7LQr08"
        }
      }
    },
    {
      "kind": "youtube#playlistItem",
      "etag": "\"CuSCwMPVmgi8taDtE2LV6HdgkN0/BCHxenW8JlvyJzcrr-0AjdpVbnk\"",
      "id": "UExVbDR1M2NOR1A2MzE3V2FTTmZtQ3ZHeW0ydWN3M29HcC45RjNFMDhGQ0Q2RkFCQTc1",
      "snippet": {
        "publishedAt": "2016-03-04T22:03:34.000Z",
        "channelId": "UCEBb1b_L6zDS3xTUrIALZOw",
        "title": "2. Divide & Conquer: Convex Hull, Median Finding",
        "description": "MIT 6.046J Design and Analysis of Algorithms, Spring 2015\nView the complete course: http://ocw.mit.edu/6-046JS15\nInstructor: Srinivas Devadas\n\nIn this lecture, Professor Devadas introduces divide-and-conquer algorithms and problems that can be solved using divide-and-conquer approaches.\n\nLicense: Creative Commons BY-NC-SA\nMore information at http://ocw.mit.edu/terms\nMore courses at http://ocw.mit.edu",
        "thumbnails": {
          "default": {
            "url": "https://i.ytimg.com/vi/EzeYI7p9MjU/default.jpg",
            "width": 120,
            "height": 90
          },
          "medium": {
            "url": "https://i.ytimg.com/vi/EzeYI7p9MjU/mqdefault.jpg",
            "width": 320,
            "height": 180
          },
          "high": {
            "url": "https://i.ytimg.com/vi/EzeYI7p9MjU/hqdefault.jpg",
            "width": 480,
            "height": 360
          }
        },
        "channelTitle": "MIT OpenCourseWare",
        "playlistId": "PLUl4u3cNGP6317WaSNfmCvGym2ucw3oGp",
        "position": 1,
        "resourceId": {
          "kind": "youtube#video",
          "videoId": "EzeYI7p9MjU"
        }
      }
    },
    {
      "kind": "youtube#playlistItem",
      "etag": "\"CuSCwMPVmgi8taDtE2LV6HdgkN0/M_9kSuMzYI4kq8yuVGC99lsB0hg\"",
      "id": "UExVbDR1M2NOR1A2MzE3V2FTTmZtQ3ZHeW0ydWN3M29HcC40NzZCMERDMjVEN0RFRThB",
      "snippet": {
        "publishedAt": "2016-01-22T21:28:07.000Z",
        "channelId": "UCEBb1b_L6zDS3xTUrIALZOw",
        "title": "R1. Matrix Multiplication and the Master Theorem",
        "description": "MIT 6.046J Design and Analysis of Algorithms, Spring 2015\nView the complete course: http://ocw.mit.edu/6-046JS15\nInstructor: Ling Ren\n\nIn this recitation, problems related to matrix multiplication and weighted interval scheduling are discussed.\n\nLicense: Creative Commons BY-NC-SA\nMore information at http://ocw.mit.edu/terms\nMore courses at http://ocw.mit.edu",
        "thumbnails": {
          "default": {
            "url": "https://i.ytimg.com/vi/09vU-wVwW3U/default.jpg",
            "width": 120,
            "height": 90
          },
          "medium": {
            "url": "https://i.ytimg.com/vi/09vU-wVwW3U/mqdefault.jpg",
            "width": 320,
            "height": 180
          },
          "high": {
            "url": "https://i.ytimg.com/vi/09vU-wVwW3U/hqdefault.jpg",
            "width": 480,
            "height": 360
          }
        },
        "channelTitle": "MIT OpenCourseWare",
        "playlistId": "PLUl4u3cNGP6317WaSNfmCvGym2ucw3oGp",
        "position": 2,
        "resourceId": {
          "kind": "youtube#video",
          "videoId": "09vU-wVwW3U"
        }
      }
    },
    {
      "kind": "youtube#playlistItem",
      "etag": "\"CuSCwMPVmgi8taDtE2LV6HdgkN0/mWibSm91yn9TtHnarSFLBue51U4\"",
      "id": "UExVbDR1M2NOR1A2MzE3V2FTTmZtQ3ZHeW0ydWN3M29HcC45NDk1REZENzhEMzU5MDQz",
      "snippet": {
        "publishedAt": "2016-01-22T21:28:05.000Z",
        "channelId": "UCEBb1b_L6zDS3xTUrIALZOw",
        "title": "3. Divide & Conquer: FFT",
        "description": "MIT 6.046J Design and Analysis of Algorithms, Spring 2015\nView the complete course: http://ocw.mit.edu/6-046JS15\nInstructor: Erik Demaine\n\nIn this lecture, Professor Demaine continues with divide and conquer algorithms, introducing the fast fourier transform.\n\nLicense: Creative Commons BY-NC-SA\nMore information at http://ocw.mit.edu/terms\nMore courses at http://ocw.mit.edu",
        "thumbnails": {
          "default": {
            "url": "https://i.ytimg.com/vi/iTMn0Kt18tg/default.jpg",
            "width": 120,
            "height": 90
          },
          "medium": {
            "url": "https://i.ytimg.com/vi/iTMn0Kt18tg/mqdefault.jpg",
            "width": 320,
            "height": 180
          },
          "high": {
            "url": "https://i.ytimg.com/vi/iTMn0Kt18tg/hqdefault.jpg",
            "width": 480,
            "height": 360
          }
        },
        "channelTitle": "MIT OpenCourseWare",
        "playlistId": "PLUl4u3cNGP6317WaSNfmCvGym2ucw3oGp",
        "position": 3,
        "resourceId": {
          "kind": "youtube#video",
          "videoId": "iTMn0Kt18tg"
        }
      }
    },
    {
      "kind": "youtube#playlistItem",
      "etag": "\"CuSCwMPVmgi8taDtE2LV6HdgkN0/sGZyr4P6Yy0qXL9r61SHMjp8X24\"",
      "id": "UExVbDR1M2NOR1A2MzE3V2FTTmZtQ3ZHeW0ydWN3M29HcC4yQUE2Q0JEMTk4NTM3RTZC",
      "snippet": {
        "publishedAt": "2016-01-25T15:46:19.000Z",
        "channelId": "UCEBb1b_L6zDS3xTUrIALZOw",
        "title": "R2. 2-3 Trees and B-Trees",
        "description": "MIT 6.046J Design and Analysis of Algorithms, Spring 2015\nView the complete course: http://ocw.mit.edu/6-046JS15\nInstructor: Amartya Shankha Biswas\n\nIn this recitation, problems related to 2-3 Trees and B-Trees are discussed.\n\nLicense: Creative Commons BY-NC-SA\nMore information at http://ocw.mit.edu/terms\nMore courses at http://ocw.mit.edu",
        "thumbnails": {
          "default": {
            "url": "https://i.ytimg.com/vi/TOb1tuEZ2X4/default.jpg",
            "width": 120,
            "height": 90
          },
          "medium": {
            "url": "https://i.ytimg.com/vi/TOb1tuEZ2X4/mqdefault.jpg",
            "width": 320,
            "height": 180
          },
          "high": {
            "url": "https://i.ytimg.com/vi/TOb1tuEZ2X4/hqdefault.jpg",
            "width": 480,
            "height": 360
          }
        },
        "channelTitle": "MIT OpenCourseWare",
        "playlistId": "PLUl4u3cNGP6317WaSNfmCvGym2ucw3oGp",
        "position": 4,
        "resourceId": {
          "kind": "youtube#video",
          "videoId": "TOb1tuEZ2X4"
        }
      }
    }
  ]
}
 * */