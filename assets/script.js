var lyricsContainer = $("#lyric-con");
var searchFormEl = $("#search-form");
searchInputEl = $("#search-song");
var lyricApi = "https://api.lyrics.ovh/";
results = $("#results");
songData = $("#song-data");
setlistRefresh = $("#clear-history");




// pass text input into getSuggestions and clear input
searchFormEl.on("submit", function(event) {
    event.preventDefault();
    // remove suggestions or lyrics
    $("#lyrics").remove();
    $('.results-header').remove();
    $(".result").remove();
    $("#metadata").remove();
    $("#save-setlist").remove();
    term = searchInputEl.val().trim();
    // run getSuggestions and delete input value
    if (term) {
        getSuggestions(term)
        searchInputEl.val("");
    }else {
        return;
    }
})

// function to take input and suggest options
getSuggestions = function(searchTerm) {
    // format suggestion api url
    var lyricSuggest = lyricApi + "/suggest/" + searchTerm;
    fetch(lyricSuggest)
    .then(function(response) {
        //request was successful
        if (response.ok) {
                response.json().then(function(data) {
                // create empty objects for suggestions and eventual selection
                var selectorData = [];
                var options = [];
                // extract specific information from suggestions and input into selectorData
                data.data.forEach(function(result){
                    if (options.length>=7) {
                        return;
                    }
                var lyricHeader = result.title + " - " + result.artist.name;
                if (options.indexOf(lyricHeader) >= 0) {
                    return;
                }

                options.push(lyricHeader);
                selectorData.push({
                    display: lyricHeader,
                    artist: result.artist.name,
                    title: result.title_short
                });
                });
//TODO: MOVE OPTIONS TO LOCALSTORAGE
                $(".results-header").remove();
                optionsHeader = $('<h2 class="text-center results-header btn-result">Options</h2>');
                results.append(optionsHeader);
            // display suggestions of search on the page
            selectorData.forEach(function(result) {
                
                var displayResults = $('<button id="option" class="btn result">' + result.display + '</button><br class="result"/>');
                results.append
                results.append(displayResults);
            // when option from suggestion is clicked displayLyrics function begins
                displayResults.click(function() {

                    displayLyrics(result);
                    displayMeta(result);
                    return;
                });
            })
            

            });
        }
    })
}

function displayLyrics(song) {
    // remove 
    $(".results-header").remove();
   $(".result").remove();
   // form Api url for song
   lyricsApi = lyricApi + "v1/" + (song.artist).replace(/' '/g, '%20') + "/" + (song.title).replace(/' '/g, '%20');
    
    //pull api data for lyrics to display and then append
    $.getJSON(lyricsApi).fail(function() {
        errorDisplay = "<h2 class='results-header'>Sorry, but we're having trouble getting the information for that song. Please try another. </h2>"
        results.append(errorDisplay);
        return;
    }).then(function(data) {
    //Add button to save to setlist
   var lyricDisplay = '<h2 class="results-header">' + song.display + '</h2>';
   lyricDisplay += '<button class="btn" id="save-setlist">Save to Setlist</button>'
   lyricDisplay += '<div id="lyrics">' + data.lyrics.replace(/\n/g, '<br />').replace('Paroles de la chanson', '').replace(song.title + ' par ' + song.artist, '') + '</div>';

   results.append(lyricDisplay);
   setLocalStorage(song);

    })
}
    


function displayMeta(data) {
    $("#metadata").remove();
    //prep apiUrl and format song terms to fit url
    artistParsed = (data.artist.replace(/\s/g, '+')).toLowerCase();
    titleParsed = (data.title.replace(/\s/g, '+')).toLowerCase();
    apiURL = "https://api.getsongbpm.com/search/?api_key=4b52f9441e5448b15c564ac30bda81a3&type=both&lookup=song:" + titleParsed + "%20artist:" + artistParsed;


    fetch(apiURL).then(result => result.json()).then(data => {
        return data.search[0];
    }).then(meta => {
        bpm = meta.tempo;
        timeSig = meta.time_sig;
        keyOf = meta.key_of;

        cardDisplay = '<br/><div id="metadata"><p><b>BPM: </b>' + bpm + '</p><p><b>Time Sig: </b>' + timeSig + '</p><p><b>Key: </b>' + keyOf + '</p></div>';
        songData.append(cardDisplay);
    }).catch(function() {
        noSongData = "<h2 class='results-header'>There is no song data available for this song. </h2>"
        songData.append(noSongData);
        return;
    })
}



// stores song data when save-setlist button is clicked
setLocalStorage = function(item) {
    setlistSave = $("#save-setlist")
    setlistSave.click(function() {
    setlistAdd = JSON.stringify(item);
    setlistOrder =  [];
    if (localStorage["setlistOrder"]) {
        setlistOrder = JSON.parse(localStorage["setlistOrder"]);
    }
    setlistOrder.unshift(item.display);
    localStorage["setlistOrder"] = JSON.stringify(setlistOrder);
    localStorage.setItem(item.display, setlistAdd);
    })

}

//TODO: GETLOCALSTORAGE FUNCTION


    getLocalStorage = function() {
        $("#lyrics").remove();
        $('.results-header').remove();
        $(".result").remove();
        $("#metadata").remove();
        $("#save-setlist").remove();
        setlistHeader = $("<h2 class='results-header'>Setlist </h2>") 
        results.append(setlistHeader);
        var values = [],
            keys = localStorage.getItem("setlistOrder");
            keys = JSON.parse(keys);
            
        if (!keys) {
            noSetlist = $("<h3 class='result'>It looks like you don't have a setlist created yet. Search some songs to add them in!</h3>")
            results.append(noSetlist);
            return;

        }
        else {
            i = keys.length;
        while ( i-- ) {
            values.push(JSON.parse(localStorage.getItem(keys[i])));
        }
    
        values.forEach(function(result) {
                  
            displayResults = $('<button id="option" class="btn result">' + result.display + '</button>');
            displayDelete = $('<button id="setlist-delete" class="btn result">Remove</button><br class="result"/>')
            results.append(displayResults);
            results.append(displayDelete);
        // when option from suggestion is clicked displayLyrics function begins
            displayResults.click(function() {
                console.log(result);
                displayLyrics(result);
                displayMeta(result);
                return;
            });
            displayDelete.click(function() {
                localStorage.removeItem(result.display);
                keyDelete = localStorage.getItem("setlistOrder");
                keyDelete = JSON.parse(keyDelete);
                i = keyDelete.indexOf(result.display)
                console.log(keyDelete);
                keyDelete.splice(i, 1);
                console.log(keyDelete);
                console.log(i);
                localStorage["setlistOrder"] = JSON.stringify(keyDelete);
                getLocalStorage();
                return;
            })
        });
    }
    }

    setlistRefresh.click(function() {
        getLocalStorage();
    });

    getLocalStorage();
