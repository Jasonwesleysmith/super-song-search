var lyricsContainer = $("#lyric-con");
var searchFormEl = $("#search-form");
searchInputEl = $("#search-song");
var lyricApi = "https://api.lyrics.ovh/";
results = $("#results");
resultss = $("#resultss");




// pass text input into getSuggestions and clear input
searchFormEl.on("submit", function(event) {
    event.preventDefault();
    // remove suggestions or lyrics
    $("#lyrics").remove();
    $('.lyrics-title').remove();
    $(".result").remove();
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
            // display suggestions of search on the page
            selectorData.forEach(function(result) {
                var displayResults = $('<button class="result">' + result.display + '</button>');
                results.append(displayResults);
            // when option from suggestion is clicked displayLyrics function begins
                displayResults.click(function() {
                    displayLyrics(result);
                    displayMeta(result);
                    return;
                });
                //console.log(displayResults);
            })
            

            });
        }
    })
}

function displayLyrics(song) {
    // remove 
   $(".result").remove();
   // form Api url for song
   console.log(song);
    $.getJSON(lyricApi + "v1/" + (song.artist).replace(/' '/g, '%20') + "/" + (song.title).replace(/' '/g, '%20'), function(data) {
        //console.log(data.lyrics);
    // create html elements to append to page and append
   
   var lyricDisplay = '<h3 class="lyrics-title">' + song.display + '</h3>';
   lyricDisplay += '<div id="lyrics">' + data.lyrics.replace(/\n/g, '<br />').replace('Paroles de la chanson', '').replace(song.title_short + ' par ' + song.artist, '') + '</div>';

   results.append(lyricDisplay);
    })

}

function displayMeta(data) {
    //prep apiUrl and format song terms to fit url
    artistParsed = (data.artist.replace(/\s/g, '+')).toLowerCase();
    titleParsed = (data.title.replace(/\s/g, '+')).toLowerCase();
    apiURL = "https://api.getsongbpm.com/search/?api_key=4b52f9441e5448b15c564ac30bda81a3&type=both&lookup=song:" + titleParsed + "%20artist:" + artistParsed;

    console.log(artistParsed);
    console.log(titleParsed);

    fetch(apiURL).then(result => result.json()).then(data => {
        return data.search[0];
    }).then(meta => {
        bpm = meta.tempo;
        timeSig = meta.time_sig;
        keyOf = meta.key_of;

        cardDisplay = '<div id="metadata"><p><em>BPM:</em>' + bpm + '</p><p><em>Time Signature:</em>' + timeSig + '</p><p><em>Key:</em>' + keyOf + '</p></div>';
        resultss.append(cardDisplay);
    })
}



   
