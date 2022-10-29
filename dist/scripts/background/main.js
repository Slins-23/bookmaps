/*
if (typeof browser == "undefined") {
    let browser = chrome;
}
*/

let loaded = false;

const bapi = typeof browser == "undefined" ? chrome : browser;
let API_KEY = "";

// let browser = typeof browser == "undefined" ? chrome : browser;
// let bookmarks = {"bookmarks": []};
let bookmarks = [];

// key == null returns whole object
async function read_storage(key) {
    return new Promise((resolve, reject) => {
        bapi.storage.local.get(key, (result) => {
            if (Object.keys(result).length == 1) {
                resolve(result[key])
            } else {
                resolve(result)
            }            
        })
    })
}

async function set_storage(key, data) {
    // let previous_storage = await read_storage(null);
    // previous_storage[key] = data;
    // console.log(`Storage previously was: ${JSON.stringify(previous_storage)}\n`)
    if (key == "bookmarks") {
        bookmarks = data;
    }

    let obj = {};
    obj[key] = data;
    return new Promise((resolve, reject) => {        
        bapi.storage.local.set(obj).then(resolve(null))
        //bapi.storage.local.set({123: "cinco"}).then(resolve(null))
        // bapi.storage.local.set({123: "cinco"})
        // console.log("St")
    })
}

async function load_api_key() {
    let stored_key = await read_storage("api_key");

    if (JSON.stringify(stored_key) == JSON.stringify({})) {
        stored_key = "";
    }

    API_KEY = stored_key;
}

async function update_key(key) {
    await set_storage("api_key", key);
    console.log(`API_KEY got updated from ${API_KEY} to ${key}`)
    API_KEY = key;
}

async function load_bookmarks() {
    console.log("Starting to load bookmarks")

    let stored_bookmarks = await read_storage("bookmarks");
    console.log(`Stored bookmarks: ${JSON.stringify(stored_bookmarks)}`)
    // bookmarks = {"bookmarks": []}

    switch (JSON.stringify(stored_bookmarks)) {
        case JSON.stringify({}):
            console.log("Setting up bookmarks for the first time")
            bookmarks = []
            await set_storage("bookmarks", [])
            break;
        case JSON.stringify([]):
            console.log("Bookmarks is empty")
            bookmarks = []
            break;
        default:
            console.log("Bookmarks were found and are being loaded")
            bookmarks = stored_bookmarks;
    }

    console.log(`Loaded bookmarks:`)

    for (let bookmark in bookmarks) {
        console.log(`${JSON.stringify(bookmark)}`)
    }
    // console.log(`Finall bookkmarks::: ${bookmarks}`)
}

function is_bookmarked(coordinates) {
    // console.log(`MRK: ${JSON.stringify(bookmark)}`)
    console.log(`current coords ${coordinates}`)

    /*
    // Already exists, checked by coordinates
    if (coordinates in bookmarks) {
        // remove_bookmark(bookmark)
        // sort_bookmarks();
        return true;
    } else {
        // add_bookmark(bookmark)
        // sort_bookmarks();
        return false;
    }

    */

    for (let cur_bkm_idx = 0; cur_bkm_idx < bookmarks.length; cur_bkm_idx++) {
        let cur_bkm = bookmarks[cur_bkm_idx]
        // console.log(`cur_bkm: ${JSON.stringify(cur_bkm)}`)
        // console.log(`Target coords: ${coordinates} | Cmp coords: ${cur_bkm.coordinates.coordinate_degrees}`)
        if (coordinates == cur_bkm.coordinates.coordinate_degrees) {
            return true;
        }
    }

    return false;
}

async function add_bookmark(bookmark, shouldReload) {
    console.log("adding bookmk")
    bookmarks.push(bookmark)
    await set_storage("bookmarks", bookmarks)

    // console.log(`TAB: ${JSON.stringify(ext_tab)} | URL: ${bapi.runtime.getURL('./')}`)
    // let ext_tab = await bapi.runtime.getBackgroundPage();
    if (shouldReload) {
        await reload()
    }
}

async function reload() {
    let ext_tab = await bapi.tabs.query({url: `${bapi.runtime.getURL('./')}*`})

    if (ext_tab.length != 0) {
        let tab = ext_tab[0]
        let windowId = tab.windowId
        let url = tab.url
        let id = tab.id
        let index = tab.index

        await bapi.tabs.reload(id, {bypassCache: true})
    }
}

async function remove_bookmark_from_coords(coords, shouldReload) {
    console.log("removing bookmk")
    bookmarks = bookmarks.filter((value, index, arr) => value.coordinates.coordinate_degrees != coords)
    await set_storage("bookmarks", bookmarks)

    if (shouldReload) {
        await reload();
    }
}

async function remove_bookmark(bookmark, shouldReload) {
    console.log("removing bookmk")
    bookmarks = bookmarks.filter((value, index, arr) => value.coordinates.coordinate_degrees != bookmark.coordinates.coordinate_degrees)
    await set_storage("bookmarks", bookmarks)

    if (shouldReload) {
        await reload();
    }

    /*
    let ext_tab = await bapi.tabs.query({url: `${bapi.runtime.getURL('./')}*`})
    // console.log(`TAB: ${JSON.stringify(ext_tab)} | URL: ${bapi.runtime.getURL('./')}`)
    // let ext_tab = await bapi.runtime.getBackgroundPage();
    if (ext_tab.length != 0) {
        let tab = ext_tab[0]
        let windowId = tab.windowId
        let url = tab.url
        let id = tab.id
        let index = tab.index

        await bapi.tabs.reload(id, {bypassCache: true})
    }
    */
}

async function execute(bookmark) {
    console.log(`Before executing: ${JSON.stringify(bookmarks)}`)
    if (is_bookmarked(bookmark.coordinates.coordinate_degrees)) {
        await remove_bookmark(bookmark, true)
    } else {
        await add_bookmark(bookmark, true)
    }
    console.log(`After executing: ${JSON.stringify(bookmarks)}`)
    // sort_bookmarks();
}

async function txxt(val) {
    return val;
}

function optional(value) {
    return value == undefined ? undefined : value
}

async function get_stored_bookmark(coordA, coordB) {
    return bookmarks.find((bookmark) => bookmark.coordinates.coordinate_degrees == `${coordA}, ${coordB}`)
    /*
    for (let i = 0; i < bookmarks.length; i++) {
        let bookmark = bookmarks[i];

        if (bookmark.coordinates.coordinate_degrees == `${coordA}, ${coordB}`) {
            return bookmark;
        }
    }
    */
}
  
async function get_bookmark(coordA, coordB) {
    

    //console.log(`actual coords: ${coordA}, ${coordB}`)

    // Get google api data (actually using Opencadedata currently as Google isn't free) containing information
    // such as country, state, city, address, street
    // from coordinates (coordA, coordB)
    // Both coordA and coordB are strings
    // These coordinates are actually cartesian coordinates
    // Apparently google translates these into real-world coordinates

    let call = `https://api.opencagedata.com/geocode/v1/json?q=${coordA},${coordB}&pretty=1&key=${API_KEY}`;
    let response_result = 0;

    let raw_response = await fetch(call).then((response) => {
        return response.json();
      //response_result == response.status;

      if (response.ok) {
        return response.json();
      } else {
        alert(`Error: Failed to fetch API.\n
                        Response status code: ${response.status}\n
                        Response message: ${response.statusText}`);
      }
    });

    //console.log("resolved")

    // if (response_result == 200 && raw_response.status.code != 200) {
    if (raw_response.status.code != 200) {
      return {
        "code": raw_response.status.code,
        "message": raw_response.status.message,
        "bookmark": undefined,
      }
      //console.log("at a")
      /*
      alert(`Error: Could not get raw data from API for current coordinates. (Latitude: ${coordA} Longitude: ${coordB}.)\n
                    Response status code: ${raw_response.status_code}\n
                    Response message: ${raw_response.message}`);
       */
    }
    // else if (response_result == 200 && raw_response.status_code == 200) {
    else if (raw_response.status.code == 200) {
      //console.log("at b")
      let relevant_data = raw_response.results[0];

      let data = {
        confidence: relevant_data.confidence,
        coordinates: {
          coordinate_degrees: `${coordA}, ${coordB}`,
          latitude_degrees: coordA,
          longitude_degrees: coordB,
          coordinate_DMS: `${relevant_data.annotations.DMS.lat}, ${relevant_data.annotations.DMS.lng}`,
          latitude_DMS: relevant_data.annotations.DMS.lat,
          longitude_DMS: relevant_data.annotations.DMS.lng,
        },
        currency: {
          currency_representation: relevant_data.annotations.currency == undefined ? undefined : optional(relevant_data.annotations.currency.symbol),
          currency_abbreviation: relevant_data.annotations.currency == undefined ? undefined : optional(relevant_data.annotations.currency.iso_code),
          currency_name: relevant_data.annotations.currency == undefined ? undefined : optional(relevant_data.annotations.currency.name),
        },
        location: {
          continent: optional(relevant_data.components.continent),
          country: optional(relevant_data.components.country),
          region: optional(relevant_data.components.region),
          state: optional(relevant_data.components.state),
          state_code: optional(relevant_data.components.state_code),
          state_district: optional(relevant_data.components.state_district),
          municipality: optional(relevant_data.components.municipality),
          city_district: optional(relevant_data.components.city_district),
          city: optional(relevant_data.components.city),
          town: optional(relevant_data.components.town),
          suburb: optional(relevant_data.components.suburb),
          road: optional(relevant_data.annotations.roadinfo.road),
          postcode: optional(relevant_data.components.postcode),
          formatted: optional(relevant_data.formatted),
          hamlet: optional(relevant_data.components.hamlet),
          neighbourhood: optional(relevant_data.components.neighbourhood),
          quarter: optional(relevant_data.components.quarter),
          city_block: optional(relevant_data.components.city_block),
          county: optional(relevant_data.components.county),
        },
        time: {
          timezone: optional(relevant_data.annotations.timezone.name),
          offset: optional(relevant_data.annotations.timezone.offset_string),
          abbreviation: optional(relevant_data.annotations.timezone.short_name),
        },

        flag: optional(relevant_data.annotations.flag),
        two_letter_cc: optional(relevant_data.components["ISO_3166-1_alpha-2"]),
        three_letter_cc: optional(relevant_data.components["ISO_3166-1_alpha-3"]),
        calling_code: optional(relevant_data.annotations.callingcode),
        streetview: {
            google: {
                before_id: "none",
                id: "none",
                after_id: "none",
                pitch: "none",
                yaw: "none",
                fov: "none",
            }
        },
      };

      console.log(data);

      return { "code": 200, "message": "OK", "bookmark": data };
    } else {
      console.log(
        `Response_result ${response_result} | raw_response.status.code: ${raw_response.status.code}`
      );
    }

    return undefined;
}

async function open_bookmark(bookmark) {
    // let width = 203;
    // let height = 100;
    // let yaw = 107.13687;
    // let pitch = 0;
    // let pic_url = `https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=${id}&cb_client=maps_sv.tactile.gps&w=${width}&h=${height}&yaw=${yaw}&pitch=${pitch}&thumbfov=100`
    // pic_url = pic_url.replace("/", "%2F").replace("?", "%3F").replace("=", "%3D").replace("&", "%26")

    let url = "";

    // If was not stored in streetview (but still in google maps)
    if (bookmark.streetview.google.before_id == "none" || bookmark.streetview.google.id == "none" || bookmark.streetview.google.after_id == "none") {

        let zoom = 15; // Ranges 3-21 (farthest - closest)
        url = `https://www.google.com/maps/@${bookmark.coordinates.latitude_degrees},${bookmark.coordinates.longitude_degrees},${zoom}z`
    } 
    
    // If was stored in streetview
    else {
        url = `https://www.google.com/maps/@${bookmark.coordinates.latitude_degrees},${bookmark.coordinates.longitude_degrees},3a,${bookmark.streetview.google.fov}y,${bookmark.streetview.google.yaw}h,${bookmark.streetview.google.street_pitch}t/data=${bookmark.streetview.google.before_id}${bookmark.streetview.google.id}${bookmark.streetview.google.after_id}`
    }

    let open_tab = await bapi.tabs.create({url: url})
    // let open_window = await bapi.windows.create({url: url});
    // open_window.addEventListener("click", () => alert("clicked"))
}

async function setup() {
    // await set_bookmarks();
    await load_api_key();
    await load_bookmarks();

    bapi.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        console.log(`req: ${JSON.stringify(request)}`)
        switch (request.type) {
            case "get_api_key":
                return API_KEY;
                break;
            case "update_key":
                await update_key(request.value)
                break;
            case "open_bookmark":
                await open_bookmark(request.value)
                break;
            case "get_bookmarks":
                console.log('at get_bookmarks')
                // sendResponse({result: bookmarks})
                return bookmarks
            case "set_bookmarks":
                console.log("KOK")
                await set_storage("bookmarks", request.value);
                console.log("KEK")
                console.log(`bookmarks var: ${JSON.stringify(bookmarks)}`)
                console.log(`storage read: ${JSON.stringify(await read_storage("bookmarks"))}`)
                break;
            case "get_bookmark":
                let bookmark = get_bookmark(request.coordA, request.coordB)
                return bookmark
                // key here
                break;
            case "get_stored_bookmark":
                let booky = await get_stored_bookmark(request.coordA, request.coordB)
                return booky;
                break;
            case "is_bookmarked":
                return is_bookmarked(request.value)
            case "execute":
                await execute(request.value)
                break;
            case "add_bookmark":
                await add_bookmark(request.value, request.shouldReload)
                break;
            case "remove_bookmark_from_coords":
                await remove_bookmark_from_coords(request.value, request.shouldReload);
                break;
            case "remove_bookmark":
                await remove_bookmark(request.value, request.shouldReload)
                break;
            case "reload":
                await reload()
                break;
            case "logg":
                // console.log("LOGGGGGGEED")
                break;
            case "has_loaded":
                return loaded;
                break;
            case "teszt":
                // console.log('at tttssst')
                // console.log(request.value)
                // let ok = await txxt(request.value);
                // bookmarks = ok;
                // console.log(`ok: ${ok}`)
                //bookmarks = txxt(request.value)
                // let ok = await txxt("123")
                // sendResponse({result: ok})
                // return ok;
                // sendResponse({result: 123})
                // console.log("before async")
                // await asinc()
                // console.log('after async')
                break;
            default:
                console.log("Invalid request type")
        }

        // console.log("before returning")
        return true;
    })

    console.log("bg script was setp")
}

/*
async function test_storage() {
    let whole_storage = await read_storage(null);
    let api_before_assigning = await read_storage("api_key");
    let bookmarks_before_assigning = await read_storage("bookmarks");
    console.log(`Whole storage before assigning: ${JSON.stringify(whole_storage)}`)
    console.log(`API key before assigning: ${JSON.stringify(api_before_assigning)}`)
    console.log(`Bookmarks key before assigning: ${JSON.stringify(bookmarks_before_assigning)}`)

    await set_storage("api_key", "123");

    whole_storage = await read_storage(null);
    let api_after_assigning = await read_storage("api_key");
    bookmarks_before_assigning = await read_storage("bookmarks");
    console.log(`Whole storage after assigning API: ${JSON.stringify(whole_storage)}`)
    console.log(`API key after assigning: ${JSON.stringify(api_after_assigning)}`)
    console.log(`Bookmarks key before assigning: ${JSON.stringify(bookmarks_before_assigning)}`)

    await set_storage("bookmarks", [])

    whole_storage = await read_storage(null);
    api_after_assigning = await read_storage("api_key");
    let bookmarks_after_assigning = await read_storage("bookmarks");
    console.log(`Whole storage after assigning Bookmarks: ${JSON.stringify(whole_storage)}`)
    console.log(`API key after assigning: ${JSON.stringify(api_after_assigning)}`)
    console.log(`Bookmarks key after assigning: ${JSON.stringify(bookmarks_after_assigning)}`)

    console.log('\n\n\n\n')

    await set_storage("api_key", "999")
    api_after_assigning = await read_storage("api_key");
    bookmarks_after_assigning = await read_storage("bookmarks");
    console.log(`API key after assigning: ${JSON.stringify(api_after_assigning)}`)
    console.log(`Bookmarks key after assigning: ${JSON.stringify(bookmarks_after_assigning)}`)
}

test_storage()
*/

setup()
loaded = true;

console.log("eof bg/main.js")