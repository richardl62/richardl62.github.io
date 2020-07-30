'use strict';

const gameServer_localserver = "http://localhost:5000";
const gameServer_webserver = "https://glacial-chamber-12465.herokuapp.com";
const default_connection_timeout = 10000; //ms

function get_game_server(local) {
    return local ? gameServer_localserver : gameServer_webserver;
}

// Send/fetch data to/from the server.
// KLUDGE? Always uses a POST request.
function game_server_fetch(path, local, data) {
    assert(typeof path == "string");
    assert(typeof local == "boolean");

    const url = get_game_server(local) + '/' + path;

    const fetch_options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };

    return fetch(url, fetch_options)
        .then(response => {
            if (response.status != 200) {
                let error_message = "Connection to server failed";
                if (response.statusText) {
                    error_message = `Server response "${response.statusText}"`
                }

                throw new Error(error_message);
            }
            return response.json()
        })
        .then(data => {
            // data.error is set if there is a 'legitimate' error,
            // i.e. a user error rather than a code error.
            if (data.error) {
                throw new Error(data.error);
            }
            return data;
        })
        .catch(err => {
            //console.log("Fetch failed:", err);
            throw err; // repropogate
        });
}

function throw_server_error(data) {
    if (data && data.server_error) {
        throw Error(ata.server_error)
    }
}


