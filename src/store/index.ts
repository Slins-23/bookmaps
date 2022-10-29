import { defineStore } from "pinia";
import type { Bookmark, Route } from "@/types";
import browser from "webextension-polyfill";

async function load_key(this: any) {
    let key = await browser.runtime.sendMessage({ type: "get_api_key" });
    this.api_key = key;
}

async function placeholder_call_api(this: any, key: string) {
    let api_url = `https://api.opencagedata.com/geocode/v1/json?q=40.7527496+-73.9888401&key=${key}`
    let response = await fetch(api_url).then((response) => response.json());

    // response.status.code == 200 -> response.status.message == "OK"
    // response.status.code == 400 -> response.status.message == "invalid coordinates"
    // response.status.code == 401 -> response.status.message == "unknown API key"

    return response.status.code
}

async function update_key(this: any, key: String) {
    await browser.runtime.sendMessage({ type: "update_key", value: key });
    this.api_key = key;
}

async function isBookmarked(this: any, coords: string) {
    let result = await browser.runtime.sendMessage({ type: "is_bookmarked", value: coords })
    return result;
}

function isBookmarkedId(this: any, id: string) {
    let bookmarks = this.bookmarks;
    for (let i = 0; i < bookmarks.length; i++) {
        let bookmark = bookmarks[i];

        if (bookmark.streetview.google.id == id) {
            return true;
        }
    }

    return false;
}

// TXT can be coordinates or website url containing coords
// Returns 1 if no explicit errors
// Returns -1 when API key is invalid
// Returns -2 when URL format is invalid
// Returns -3 if error when trying to get bookmark from coordinates
async function addBookmark(this: any, txt: string, shouldReload: boolean) {
    try {
        let coords = txt;

        // If is an URL
        if (txt.indexOf("google.com") != -1) {
            let actual_coords = txt.split("@")[1].split(",");
            // If not a valid url, return error number
            if ((txt.indexOf("place") != -1) || ((txt.indexOf("y,") == -1 || txt.indexOf("t/") == -1) && (actual_coords.length != 3))) {
                return -2;
            } else {
                coords = `${actual_coords[0]}, ${actual_coords[1]}`;
            }
        }

        let coordA = "";
        let coordB = "";

        let separators = [",", " ", ":"]

        for (let i = 0; i < separators.length; i++) {
            if (coords.indexOf(separators[i]) != -1) {
                let separated = coords.split(separators[i]);
                coordA = separated[0];
                coordB = separated[separated.length - 1];
                break;
            }
        }

        coordA = coordA.trim();
        coordB = coordB.trim();

        if (coordA == "" || coordB == "" || isNaN(coordA as any) || isNaN(coordB as any)) {
            // alert("Invalid format! Please input either a google maps URL containing coordinates or the coordinates themselves separated by ',', ' ', or ':'.")
            return -2;
        }

        //let bookmark: Bookmark = await browser.runtime.sendMessage({type: "get_bookmark", coordA: coordA, coordB: coordB});
        let response = await browser.runtime.sendMessage({ type: "get_bookmark", coordA: coordA, coordB: coordB });

        if (response.code == 401) {
            return -1;
        } else if (response.code == 403 || response.code == 503) {
            return -4;
        }

        let bookmark = undefined;

        if (response.code == 200) {
            bookmark = response.bookmark;
        }


        if (bookmark == undefined) {
            // alert(`Could not get API information for coordinates ${coordA}, ${coordB}`)
            return -3;
        }

        // Is a Street View/Panorama 360 picture URL
        if (txt.length > 74) {
            let fov = txt.split(",")[3].replace("y", "")

            // Horizontal
            let yaw = txt.split(",")[4].replace("h", "")


            let before_id = "none";
            let id = "none";
            let after_id = "none";
            if (txt.indexOf("streetviewpixels") != -1) {
                id = txt.split("%3D")[1].split("%26")[0];
                before_id = txt.split("data=")[1].split(id)[0];
                after_id = txt.split("http")[1].split("data=")[1].split(id)[1] + txt.split("thumbfov")[1].slice(txt.split("thumbfov")[1].indexOf("!"));
            }

            else if (txt.indexOf("googleusercontent") != -1) {
                id = txt.split("%2F")[4].split("%3D")[0];
                before_id = txt.split("data=")[1].split(id)[0];
                after_id = txt.split("http")[1].split("data=")[1].split(id)[1] + '!' + txt.split("!")[8] + '!' + txt.split("!")[9];
            }
            else {
                id = txt.split("data=")[1];

                let last_idx = 0;
                let count = 0;

                for (let i = 0; i < id.length; i++) {
                    let char = id[i];

                    if (char == "!" && count > 10) {
                        last_idx = i;
                        break;
                    } else if (char == "!" && count != 22) {
                        count = 0;
                    } else {
                        count++;
                    }
                }

                id = txt.length < 145 ? id.slice(last_idx - 22, last_idx) : id.slice(last_idx - 44, last_idx)

                before_id = txt.split("data=")[1].split(id)[0]
                after_id = txt.split("data=")[1].split(id)[1]
            }



            bookmark.streetview.google.before_id = before_id;
            bookmark.streetview.google.id = id;
            bookmark.streetview.google.after_id = after_id;
            bookmark.streetview.google.fov = fov;

            // Vertical (1-180 ?) 
            // In the URL goes from 1 to 180
            // On the streetview api for thumbnails goes from -90 to 90 (although you can exceed this, the image will turn upside down
            // therefore they cap it on the streetview)
            // We need to convert the range from 1 to 180 to -90 to 90 through a linear equation
            // Closest is thumbnail_pitch(street_pitch) = 180/-178 * street_pitch + 180/178 + 90
            // Where thumbnail_pitch(1) = 90 | thumbnail_pitch(180) = -90
            let pitch = txt.split(",")[5].split("t")[0]
            bookmark.streetview.google.street_pitch = pitch;
            bookmark.streetview.google.thumbnail_pitch = ((180 / -178 * parseFloat(pitch)) + (180 / 178) + 90).toString();
            bookmark.streetview.google.yaw = yaw;
        } 
        
        // Not a Street View/Panorama 360 picture, but a Google Maps URL
        else {
            bookmark.streetview.google
        }



        let bookmarks = this.bookmarks;

        if (bookmarks.includes(bookmark)) {
            return 0;
        }

        await browser.runtime.sendMessage({ type: "add_bookmark", value: bookmark, shouldReload: shouldReload });

        if (!shouldReload) {
            this.bookmarks.push(bookmark)

            bookmarks = this.bookmarks

            let sample_bookmark: any = undefined;

            if (this.shown_bookmarks.length != 0) {
                sample_bookmark = this.shown_bookmarks[0]
            }

            let previous_level_idx = this.levels.indexOf(this.level) - 1;

            // Matches all levels up to and including the previous one
            this.shown_bookmarks = bookmarks.filter((book: Bookmark) => {
                for (let i = 0; i < previous_level_idx; i++) {
                    let level = this.levels[i];

                    if (book.location[level as keyof {}] != sample_bookmark.location[level as keyof {}]) {
                        return false;
                    }
                }

                return true;
            })

            // Removes duplicates (cards with the same name at the current level) / Could be included above but I prefer to separate for clarity
            let in_display: string[] = [];
            this.shown_bookmarks = this.shown_bookmarks.filter((book: Bookmark) => {
                let current_location = book.location[this.level as keyof {}]

                if (!in_display.includes(current_location)) {
                    in_display.push(current_location)
                    return true;
                } else {
                    return false;
                }
            })
        }
    } catch (e) {
        console.log(`Could not add bookmark. Error:${e}. Likely related to invalid input.`);
        return -2;
    }


    return 1;
}

async function removeBookmark(this: any, event: Event, bookmark: Bookmark) {
    event.stopPropagation()

    console.log("AT 1")
    let bookmarks = this.bookmarks
    let new_bookmarks = bookmarks

    new_bookmarks = new_bookmarks.filter((book: Bookmark) => {
        for (let i = 0; i < this.levels.indexOf(this.level) + 1; i++) {
            if (book.location[this.levels[i] as keyof {}] != bookmark.location[this.levels[i] as keyof {}]) {
                return true;
            }
        }

        return false;
    })

    // If not at the last level, make sure that user is aware that he will remove multiple bookmarks
    // if (bookmarks.length - new_bookmarks.length > 1) {
    let result: boolean = confirm(`Are you sure that you want to remove all bookmarks after this level? ${bookmarks.length - new_bookmarks.length} are going to be removed.`)

    if (!result) {
        return;
    }
    // }

    // IF HAS OTEHR BOOKMARKS HERE AND STAYING IN THIS LEVEL, REMOVE DELETED BOOKMARK
    // OTHERWISE GO TO LEVEL PRIOR

    let has_others = false;
    let last_level_matched = 0;

    if (this.level != this.levels[0]) {
        for (let i = 0; i < new_bookmarks.length; i++) {
            for (let j = 0; j < this.levels.indexOf(this.level); j++) {
                if (new_bookmarks[i].location[this.levels[j] as keyof {}] == bookmark.location[this.levels[j] as keyof {}]) {
                    if (j > last_level_matched) {
                        last_level_matched = j;
                    }
                } else {
                    break;
                }
            }
        }
    }

    console.log("AT K")

    this.removed_bookmark = bookmark
    this.bookmarks = new_bookmarks

    if (this.level == this.levels[0] || last_level_matched == this.levels.indexOf(this.level) - 1) {
        let idx = this.shown_bookmarks.indexOf(bookmark)
        this.shown_bookmarks.splice(idx, 1)
    } else {
        this.shown_bookmarks = []

        while (this.levels.indexOf(this.level) - 1 != last_level_matched) {
            this.previousLevel()
        }
    }

    console.log("AT 3")
    console.log(`${JSON.stringify(new_bookmarks)}`)
    await browser.runtime.sendMessage({ type: "set_bookmarks", value: JSON.parse(JSON.stringify(new_bookmarks)) });
    console.log("AT 4")


}

async function setBookmarks(this: any, bookmarks: any) {
    await browser.runtime.sendMessage({ type: "set_bookmarks", value: JSON.parse(JSON.stringify(bookmarks)) })

    // Go back to first level
    while (this.level != this.levels[0]) {
        this.previousLevel()
    }

    // Update bookmarks and shown bookmarks
    this.bookmarks = bookmarks;

    // Removes duplicates (cards with the same name at the current level) / Could be included above but I prefer to separate for clarity
    let in_display: string[] = [];
    this.shown_bookmarks = this.bookmarks.filter((book: Bookmark) => {
        let current_location = book.location[this.level as keyof {}]

        if (!in_display.includes(current_location)) {
            in_display.push(current_location)
            return true;
        } else {
            return false;
        }
    })

    // this.showImportModal = false;
}

async function loadBookmarks(this: any) {
    this.loading_bookmarks = true;

    let check_if_loaded = setInterval(async () => {
        let has_loaded = await browser.runtime.sendMessage({ type: "has_loaded" });

        if (has_loaded) {
            await browser.runtime
                .sendMessage({ type: "get_bookmarks" })
                .then((data) => {
                    console.log("getting data");
                    console.log(`actual data: ${JSON.stringify(data)}`);
                    this.bookmarks = data;

                    let in_display: string[] = [];
                    this.shown_bookmarks = this.bookmarks.filter((book: Bookmark) => {
                        if (!in_display.includes(book.location[this.level as keyof {}])) {
                            in_display.push(book.location[this.level as keyof {}])
                            return true;
                        } else {
                            return false;
                        }
                    });

                    this.loading_bookmarks = false;
                    console.log("got data");
                    console.log(`Loaded: ${JSON.stringify(this.bookmarks)}`)
                });

            clearInterval(check_if_loaded)
        }
    }, 50)



    this.bookmarks_loaded = true;
}

function matchLocation(bookmarks: Bookmark[], level: string, value: string) {
    return bookmarks.filter((bookmark: Bookmark) => {
        if (bookmark.location[level as keyof {}] == value) {
            return true;
        } else {
            return false;
        }
    })
}

function removeDuplicates(this: any, level: string, bookmarks: Bookmark[]) {
    let in_display: string[] = [];
    bookmarks = bookmarks.filter((book: Bookmark) => {
        let current_location = book.location[level as keyof {}];

        // Show this bookmark regardless of duplicates, if it's unknown at this level
        // Possibly add an ID for differentiation of unknown locations
        if (current_location == "") { return true; }

        if (!in_display.includes(current_location)) {
            in_display.push(current_location)
            return true;
        } else {
            return false;
        }
    });

    return bookmarks
}

/*
function updateLevel(this: any, new_lvl: string, clicked?: Bookmark) {
    // If level has not changed or new level does not exist, do nothing
    if (new_lvl == this.level || this.levels.indexOf(new_lvl) == -1) { return; }

    let bookmarks = this.bookmarks['bookmarks'];
    let current_level_idx = this.levels.indexOf(this.lvl);
    let new_level_idx = this.levels.indexOf(new_lvl);

    for (let i = 0; i < new_level_idx; i++) {
        bookmarks = matchLocation(bookmarks, this.levels.indexOf(i), clicked.location[this.levels.indexOf(i) as keyof {}])
    }

    this.shown_bookmarks = removeDuplicates(bookmarks, lvl);
    this.level = new_lvl;
}
*/

function previousLevel(this: any) {
    let current_level_idx = this.levels.indexOf(this.level)
    let previous_level_idx = current_level_idx - 1;
    let bookmarks = this.bookmarks;
    let sample_bookmark = this.shown_bookmarks.length != 0 ? this.shown_bookmarks[0] : this.removed_bookmark;

    for (let j = previous_level_idx; j > -1; j--) {
        console.log(`Ran, J:${j}`)
        let level = this.levels[j];

        let temp = bookmarks.filter((book: Bookmark) => {
            for (let i = 0; i < j; i++) {
                let local_level = this.levels[i];

                if (book.location[local_level as keyof {}] != sample_bookmark.location[local_level as keyof {}]) {
                    return false;
                }
            }

            return true;
        })

        let found = false;

        for (let i = 0; i < temp.length; i++) {
            if (temp[i].location[level as keyof {}] != undefined) {
                // alert("eee")
                found = true;
                break;
            }
        }

        if (found) {
            previous_level_idx = j;
            break;
        }
    }

    /*
    // Gets next level index by finding first non undefined level
    for (let j = previous_level_idx; j > this.levels.indexOf("country") + 1; j--) {
        let level = this.levels[j];

        let temp = bookmarks.filter((book: Bookmark) => {
            for (let i = 0; i < j; i++) {
                let level = this.levels[i];
    
                if (book.location[level as keyof {}] != sample_bookmark.location[level as keyof {}]) {
                    return false;
                }
            }
    
            return true;
        })

        let found = false;

        for (let i = 0; i < temp.length; i++) {
            if (temp[i].location[level as keyof {}] != undefined) {
                previous_level_idx = j;
                found = true;
                break;
            }
        }

        if (found) {
            break;
        }
    }
    */

    /*
    // If the current level does not directly descend but is a descendant of the country level,
    // in order to avoid meaningless nesting such as 
    //            South America -> Brazil -> Rio de Janeiro -> Unknown -> Unknown -> Unknown -> City
    // make it as South America -> Brazil -> Rio de Janeiro -> City
    // i.e. continent -> country -> Y (direct descendant, previous level is always country) -> X (indirect descendant, previous level is unknown)
    // Find previous level: If, in a given country, any bookmarks have a given level, set it as the previous level
    // Otherwise, skip it and decrease the level by one and repeat the process, until at least one bookmark in a given country
    // has a certain level.0
    if (current_level_idx > this.levels.indexOf("country") + 1) {
        for (let i = previous_level_idx; i > this.levels.indexOf("country"); i--) {
            let level = this.levels[i];
            let level_exists_in_country = false;
    
            // Go through all bookmarks in the same country and check whether at least one bookmark has a given entry
            // If it doesn't, skip that level altogether, otherwise, set it as the previous level
            for (let j = 0; j < same_country_bookmarks.length; j++) {
                let current_bookmark = same_country_bookmarks[j];
                
                if (current_bookmark.location[level as keyof {}] != undefined) {
                    level_exists_in_country = true;
                    break;
                }
            }
    
            if (level_exists_in_country) {
                previous_level_idx = i;
                break;
            }
        }
    }
    */


    this.level = this.levels[previous_level_idx]

    // Matches all levels up to and including the previous one
    this.shown_bookmarks = bookmarks.filter((book: Bookmark) => {
        for (let i = 0; i < previous_level_idx; i++) {
            let level = this.levels[i];

            if (book.location[level as keyof {}] != sample_bookmark.location[level as keyof {}]) {
                return false;
            }
        }

        return true;
    })

    // Removes duplicates (cards with the same name at the current level) / Could be included above but I prefer to separate for clarity
    let in_display: string[] = [];
    this.shown_bookmarks = this.shown_bookmarks.filter((book: Bookmark) => {
        let current_location = book.location[this.level as keyof {}]

        if (!in_display.includes(current_location)) {
            in_display.push(current_location)
            return true;
        } else {
            return false;
        }
    })

    /*
    // If returning from unknown
    if (this.shown_bookmarks[0][this.level as keyof {}] == undefined) {
        // Return all up to this level
    }

    let bookmarks = this.bookmarks['bookmarks'];
    let shown_bookmarks = this.shown_bookmarks;
    let sample_bookmark = shown_bookmarks[0];

    let current_level_idx = this.levels.indexOf(this.level);
    let previous_levels = [];

    for (let i = current_level_idx - 1; i > -1; i--) {
        previous_levels.push(this.levels[i]);
    }

    let previous_level = "";

    for (let i = 0; i < previous_levels.length; i++) {
        if (sample_bookmark.location[previous_levels[i] as keyof {}] != undefined) {
            previous_level = previous_levels[i];
            break;
        }
    }

    this.shown_bookmarks = bookmarks.filter(
        (cmp_bookmark: Bookmark) => {
            for (let i = 0; i < this.levels.indexOf(previous_level); i++) {
                if (sample_bookmark.location[this.levels[i] as keyof {}] != undefined) {
                    if (
                        sample_bookmark.location[this.levels[i] as keyof {}] !=
                        cmp_bookmark.location[this.levels[i] as keyof {}]
                    ) {
                        return false;
                    }
                }
            }

            return true;
        }
    );

    let in_display: string[] = [];
    this.shown_bookmarks =
        this.shown_bookmarks.filter(
            (cmp_bookmark: Bookmark) => {
                if (
                    !in_display.includes(
                        cmp_bookmark.location[previous_level as keyof {}]
                    )
                ) {
                    in_display.push(cmp_bookmark.location[previous_level as keyof {}]);
                    return true;
                } else {
                    return false;
                }
            }
        );

    this.level = previous_level;
    */
}

async function nextLevel(this: any, bookmark: Bookmark) {
    // If clicking a bookmark when already at the last level, show dialog then return
    if (this.level == this.levels[this.levels.length - 1]) {
        await browser.runtime.sendMessage({ type: "open_bookmark", value: JSON.parse(JSON.stringify(bookmark)) })
        return
    }

    let bookmarks = this.bookmarks;
    let current_level_idx = this.levels.indexOf(this.level)
    let next_level_idx = current_level_idx + 1;

    // Gets next level index by finding first non undefined level
    for (let j = next_level_idx; j < this.levels.length; j++) {
        let level = this.levels[j];

        let temp = bookmarks.filter((book: Bookmark) => {
            for (let i = 0; i < j; i++) {
                let level = this.levels[i];

                if (book.location[level as keyof {}] != bookmark.location[level as keyof {}]) {
                    return false;
                }
            }

            return true;
        })

        let found = false;

        for (let i = 0; i < temp.length; i++) {
            if (temp[i].location[level as keyof {}] != undefined) {
                next_level_idx = j;
                found = true;
                break;
            }
        }

        if (found) {
            break;
        }
    }

    // Updates current level to new one
    this.level = this.levels[next_level_idx]

    // Matches all levels up to the next one
    this.shown_bookmarks = bookmarks.filter((book: Bookmark) => {
        for (let i = 0; i < next_level_idx; i++) {
            let level = this.levels[i];

            if (book.location[level as keyof {}] != bookmark.location[level as keyof {}]) {
                return false;
            }
        }

        return true;
    })

    // Removes duplicates    / Could be included above but I prefer to separate for clarity
    let in_display: string[] = [];
    this.shown_bookmarks = this.shown_bookmarks.filter((book: Bookmark) => {
        if (this.level != "formatted") {
            let current_location = book.location[this.level as keyof {}]

            if (!in_display.includes(current_location)) {
                in_display.push(current_location)
                return true;
            } else {
                return false;
            }
        } else {
            let current_location = book.coordinates.coordinate_degrees;

            if (!in_display.includes(current_location)) {
                in_display.push(current_location)
                return true;
            } else {
                return false;
            }
        }

    })



    /*
    // If bookmark location has unknown at this level and it was clicked, show next iteration of unknowns, then return
    if (bookmark.location[this.level as keyof {}] == undefined) {
        this.shown_bookmarks = bookmarks.filter((book: Bookmark) => {
            
            // Go through all levels
            for (let i = 0; i < current_level_idx + 1; i++) {
                let level = this.levels[i];

                // Compare the clicked bookmark with any one given bookmark. If they're not the same, do not include the subject
                if (book.location[level as keyof {}] != bookmark.location[level as keyof {}]) {
                    return false;
                }
            }

            return true;
        })

        this.unknown_shown = true;

        return
    } else {
        this.unknown_shown = false;
    }
    */


}

/*
function nextLevel(this: any, bookmark: Bookmark) {
    console.log(`Bookmark: ${JSON.stringify(bookmark)}`)
    let bookmarks = this.bookmarks['bookmarks'];
    let current_level_idx = this.levels.indexOf(this.level);


    console.log(`Bookmark: ${JSON.stringify(bookmark)}`)
    console.log(`Current level idx: ${current_level_idx}`)
    console.log(`Current level idx+ 1: ${current_level_idx + 1}`)
    console.log(`Levels: ${this.levels}`)
    console.log(`Levels[currentlevelidx + 1]: ${this.levels[current_level_idx + 1]}`)

    if (this.level == this.levels[this.levels.length - 1]) {
        // Show popup dialog when formatted card is clicked
        return;
    }



    // If the next level exists
    if (bookmark.location[this.levels[current_level_idx + 1] as keyof {}] != undefined) {
        if (current_level_idx > 0) {
            this.shown_bookmarks = bookmarks.filter((cmp_bookmark: Bookmark) => {
                return cmp_bookmark.location[this.levels[0] as keyof {}] == bookmark.location[this.levels[0] as keyof {}]
            })

            // Filters all previous selections
            for (let i = 1; i < current_level_idx; i++) {
                if (bookmark.location[this.levels[i] as keyof {}] != undefined) {
                    console.log("At B")
                    this.shown_bookmarks = this.shown_bookmarks.filter((cmp_bookmark: Bookmark) => {
                        return cmp_bookmark.location[this.levels[i] as keyof {}] == bookmark.location[this.levels[i] as keyof {}]
                    })
                }

                console.log(`After ${i}: ${JSON.stringify(this.shown_bookmarks)}`)
            }

            this.shown_bookmarks = this.shown_bookmarks.filter((cmp_bookmark: Bookmark) => {
                return cmp_bookmark.location[this.level as keyof {}] == bookmark.location[this.level as keyof {}]
            })

        } else {
            this.shown_bookmarks = bookmarks.filter((cmp_bookmark: Bookmark) => {
                console.log(`${cmp_bookmark.location[this.level as keyof {}]} | ${bookmark.location[this.level as keyof {}]}`)
                return cmp_bookmark.location[this.level as keyof {}] == bookmark.location[this.level as keyof {}]
            })
        }

        console.log(`Afteriflese: ${JSON.stringify(this.shown_bookmarks)}`)

        console.log("ced")
        let in_display: string[] = [];

        this.shown_bookmarks = this.shown_bookmarks.filter((book: Bookmark) => {
            // console.log(`OKQ: in_display: ${in_display} | BOOK..: ${book.location[this.levels[current_level_idx + 1] as keyof {}]}`)

            if (!in_display.includes(book.location[this.levels[current_level_idx + 1] as keyof {}])) {
                in_display.push(book.location[this.levels[current_level_idx + 1] as keyof {}])
                return true;
            } else {
                return false;
            }
        })

        console.log(`Here: ${this.levels[current_level_idx + 1]}`)
        this.level = this.levels[current_level_idx + 1];
        return;
    }

    // If the next level doesn't exist 
    else if (bookmark.location[this.levels[current_level_idx + 1] as keyof {}] == undefined) {

        // Matches all previous selections but does not include current
        this.shown_bookmarks = bookmarks.filter((cmp_bookmark: Bookmark) => {
            for (let i = 0; i < current_level_idx; i++) {
                if (bookmark.location[this.levels[i] as keyof {}] != undefined) {
                    if (bookmark.location[this.levels[i] as keyof {}] != cmp_bookmark.location[this.levels[i] as keyof {}]) {
                        return false;
                    }
                }

            }

            return true;
        })

        for (let i = current_level_idx + 2; i < this.levels.length; i++) {
            if (bookmark.location[this.levels[i] as keyof {}] != undefined) {
                // If is not formatted
                if (this.levels[i] != this.levels[this.levels.length - 1]) {
                    // Display only one that matches
                    let in_display: string[] = [];
                    this.shown_bookmarks = this.shown_bookmarks.filter((cmp_bookmark: Bookmark) => {
                        if (cmp_bookmark.location[this.levels[current_level_idx] as keyof {}] == bookmark.location[this.levels[current_level_idx] as keyof {}] && !in_display.includes(cmp_bookmark.location[this.levels[current_level_idx] as keyof {}])) {
                            in_display.push(cmp_bookmark.location[this.levels[current_level_idx] as keyof {}]);
                            return true;
                        } else {
                            return false;
                        }
                    })
                }
                // If is formatted
                else {
                    // Display all that match
                    this.shown_bookmarks = this.shown_bookmarks.filter((cmp_bookmark: Bookmark) => {
                        if (cmp_bookmark.location[this.levels[current_level_idx] as keyof {}] == bookmark.location[this.levels[current_level_idx] as keyof {}]) {
                            return true;
                        } else {
                            return false;
                        }
                    })
                }

                this.level = this.levels[i];
                return;
            }


        }
    }


    else {
        console.log("KE")
    }
}
*/

function toggleAddModal(this: any) {
    this.showAddModal = !this.showAddModal
}

function toggleSettingsModal(this: any) {
    this.showSettingsModal = !this.showSettingsModal
}

function toggleExportModal(this: any) {
    this.showExportModal = !this.showExportModal;
}

function toggleImportModal(this: any) {
    this.showImportModal = !this.showImportModal;
}

function levelText(this: any) {
    return (this.level[0].toUpperCase() + this.level.slice(1))
        .split("_")
        .join(" ");
}

function updateRoute(this: any) {
    let current_route = "/" + document.URL.split("/")[4];

    for (let i = 0; i < this.routes.length; i++) {
        if (this.routes[i].route == current_route) {
            this.current_tab = this.routes[i].id;
            break;
        }
    }
}

function sorted_bookmarks(this: any) {

    // Add additional sort based on coordinates if bookmarks are in the same street (below defaults to false for now in these cases)
    return this.shown_bookmarks.sort((bookA: Bookmark, bookB: Bookmark) => {
        return bookA.location[this.level as keyof {}] > bookB.location[this.level as keyof {}]
    })
}

export const useStore = defineStore({
    id: "bookstore",
    state: () => ({
        routes: [
            {
                id: 0,
                title: "Bookmarks",
                route: "/",
            },
            {
                id: 1,
                title: "Favorites",
                route: "/about",
            },
        ] as Route[],
        current_tab: 0,
        api_key: "",
        bookmarks: [] as Bookmark[],
        shown_bookmarks: [] as Bookmark[],
        removed_bookmark: undefined,
        tab: 0,
        unknown_shown: false,
        search: "",
        level: "continent",
        levels: [
            "continent",
            "country",
            "state",
            "state_district",
            "county",
            "municipality",
            "city",
            "city_district",
            "town",
            "suburb",
            "neighbourhood",
            "formatted",
        ],
        loading_bookmarks: false,
        bookmarks_loaded: false,
        showAddModal: false,
        showSettingsModal: false,
        showImportModal: false,
        showExportModal: false,
        import_replaceAll: false,
        import_textContent: ""
    }),
    getters: {
        levelText,
        sorted_bookmarks,
    },
    actions: {
        load_key,
        placeholder_call_api,
        update_key,
        updateRoute,
        loadBookmarks,
        previousLevel,
        nextLevel,
        addBookmark,
        removeBookmark,
        toggleAddModal,
        toggleSettingsModal,
        toggleExportModal,
        toggleImportModal,
        isBookmarked,
        isBookmarkedId,
        setBookmarks
    }
})