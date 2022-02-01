var lyricsContainer = $("#lyric-con");
var searchFormEl = $("#search-form")
searchInputEl = $("#search-song");
var lyricApi = "https://api.lyrics.ovh/";
results = $("#results");



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
                    title: result.title
                });
                });
            // display suggestions of search on the page
            selectorData.forEach(function(result) {
                var displayResults = $('<button class="result">' + result.display + '</button>');
                results.append(displayResults);
            // when option from suggestion is clicked displayLyrics function begins
                displayResults.click(function() {
                    displayLyrics(result);
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
    $.getJSON(lyricApi + "v1/" + song.artist + "/" + song.title, function(data) {
        console.log(data.lyrics);
    // create html elements to append to page and append
   var lyricDisplay = '<h3 class="lyrics-title">' + song.display + '</h3>';
   lyricDisplay += '<div id="lyrics">' + data.lyrics.replace(/\n/g, '<br />').replace('Paroles de la chanson', '').replace(song.title + ' par ' + song.artist, '') + '</div>';

   lyricsContainer.append(lyricDisplay);
    })

}