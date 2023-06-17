let url = window.location.href;
const bapi = typeof browser == "undefined" ? chrome : browser;
/*
async function test() {
    let parsed_json = await fetch(bapi.runtime.getURL("db.json")).then(response => response.json())
    console.log(parsed_json[0].documentation)
}

test();
*/

// driver.execute_script("return window.performance.getEntries().filter((e) => ((e.initiatorType == 'xmlhttprequest') && (e.name.indexOf('m3u8') != -1 && e.name.indexOf('h264') != -1))).map((e) => e.name)")
// find through url
// check when changed then update

//let previous_coordinates = "";
function find_by_xpath(xpath) {
  try {
    return document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
  } catch (e) {
    return -1;
  }
}

function setup_map_bookmark() {
  maps_is_setup = true;

  let interval = 10; // Milliseconds
  let is_open = false;
  let card = undefined;
  let button = undefined;
  let old_url = undefined;
  let is_actually_bookmarked = false;

  console.log("setup_map_bookmark()")

  // let last_coords = undefined;

  // Check if there are two classes in the classname, this means its open as well as xpath found
  let open_card_classname = "Tc0rEd U5xfxc Hqf5kd";
  let open_card_xpath =
    "/html/body/div[3]/div[9]/div[23]/div[1]/div[2]/div[2]/div";

  let placeholder_position_classname = "";
  let placeholder_position_xpath =
    "/html/body/div[3]/div[9]/div[23]/div[1]/div[2]/div[2]/div/span";

  //let photo_classname = " BfRbx"
  //let photo_xpath = "/html/body/div[3]/div[9]/div[23]/div[1]/div[2]/div[2]/div/button[1]"

  let found_classname = undefined;
  //let found_xpath = "/html/body/div[3]/div[9]/div[23]/div[1]/div[2]/div[2]/div/div[2]/button[2]"
  // let found_xpath = "/html/body/div[3]/div[9]/div[23]/div[1]/div[2]/div[2]/div/div[3]/button[2]"

  let interval_id = setInterval(run_routinely, interval);

  async function get_coordinates() {
    // let found = card.children[4].children[3];
    let found = undefined;

    // Optimization to store whatever the classname is in the element that holds the coordinates, so that we don't have to loop through the children nodes everytime
    if (found_classname == undefined) {
      for (let i = 0; i < card.children.length; i++) {
        let elm = card.children[i];

        if (elm.attributes.role != undefined) {
          // Store last child of found element, which contains the coordinates
		  
		  let new_found = undefined;

          try {
            new_found = elm.children[elm.children.length - 1].children[1];
          } catch {
            break;
          }
          

          if (new_found != undefined) {
            found = new_found;
            found_classname = found.className;
          }

          break;
        }
      }
    }

    if (found_classname == undefined || found_classname == "") {
      // Need to wait until this element is available (length is 1, found[0])
      // Tries to find it within 4000ms
      // found = find_by_xpath(found_xpath);

      // if (found == -1) {
      // if (found == -1) {
      if (found == undefined || found.tagName != "BUTTON" || found.innerText == "") {
        let wait_time = 4000;
        let interval_wait = 50;

        let should_stop = false;

        let new_int = setInterval(() => {
          for (let i = 0; i < card.children.length; i++) {
            let elm = card.children[i];

            if (elm.attributes.role != undefined) {
              // Store last child of found element, which contains the coordinates
			  
			  let new_found = undefined;

              try {
                new_found = elm.children[elm.children.length - 1].children[1];
              } catch {
                break;
              }
              

              if (new_found != undefined) {
                found = new_found;
                found_classname = found.className;
              }

              break;
            }
          }

          //found = card.getElementsByClassName('nGhxh-tv6Bve GaSlwc-uhFGfc-WsjYwc-zfKixb-UacCoe');
          // console.log(`running interval 1. left: ${wait_time}`);

          if (found != undefined && found_classname != undefined && found_classname != "" && found.tagName == "BUTTON" && found.innerText != "") {
            clearInterval(new_int);
            should_stop = true;
          } else if (wait_time == 0) {
            clearInterval(new_int);
            should_stop = true;
          }

          wait_time -= interval_wait;
        }, interval_wait);

        while (!should_stop) {
          await new Promise((r) => setTimeout(r, interval_wait));
        }

      }
    } else {
      found = document.getElementsByClassName(found_classname);

      // if (found == -1) {
      if (found.length != 1) {
        let wait_time = 4000;
        let interval_wait = 50;

        let should_stop = false;

        let new_int = setInterval(() => {
          found = document.getElementsByClassName(found_classname);
          //found = card.getElementsByClassName('nGhxh-tv6Bve GaSlwc-uhFGfc-WsjYwc-zfKixb-UacCoe');
          // console.log(`running interval 1. left: ${wait_time}`);

          if (found.length == 1) {
            clearInterval(new_int);
            should_stop = true;
          } else if (wait_time == 0) {
            clearInterval(new_int);
            should_stop = true;
          }

          wait_time -= interval_wait;
        }, interval_wait);

        while (!should_stop) {
          await new Promise((r) => setTimeout(r, interval_wait));
        }

      }

      if (found.length == 1) {
        found = found[0];
      } else {
        found = -1;
      }
    }

    if (found == -1) {
      return undefined;
    }

    let actual_coords_element = found;



    // After is available, check if it's empty, need to wait until it isn't (innerText != "")

    if (actual_coords_element.innerText == "") {
      let wait_time = 4000;
      let interval_wait = 50;

      let should_stop = false;

      let new_int = setInterval(async () => {
        // console.log(`running interval 2. left: ${wait_time}`);

        if (actual_coords_element.innerText != "") {
          clearInterval(new_int);
          should_stop = true;
        } else if (wait_time == 0) {
          clearInterval(new_int);
          should_stop = true;
        }

        found = document.getElementsByClassName(found_classname);

        // if (found == -1) {

        /*
        if (found.length != 1) {
          let wait_time = 4000;
          let interval_wait = 50;

          let should_stop = false;

          console.log("789");

          let new_int = setInterval(() => {
            found = document.getElementsByClassName(found_classname);
            //found = card.getElementsByClassName('nGhxh-tv6Bve GaSlwc-uhFGfc-WsjYwc-zfKixb-UacCoe');
            // console.log(`running interval 1. left: ${wait_time}`);

            if (found.length == 1) {
              clearInterval(new_int);
              should_stop = true;
            } else if (wait_time == 0) {
              clearInterval(new_int);
              should_stop = true;
            }

            wait_time -= interval_wait;
          }, interval_wait);

          while (!should_stop) {
            await new Promise((r) => setTimeout(r, interval_wait));
          }

          console.log("111213");
        }
        */

        if (found.length == 1) {
          found = found[0];
          actual_coords_element = found;
        } else {
          found = undefined;
        }

        wait_time -= interval_wait;
      }, interval_wait);

      while (!should_stop) {
        await new Promise((r) => setTimeout(r, interval_wait));
      }
    }


    // Now it isn't empty and we have some coordinates.
    /*
            // If the coordinates are still the same, 
            if (previous_coordinates == current_coordinates) {

            } else {

            }

            previous_coordinates = current_coordinates
        */

    // Wait until coordinates are not the same.
    // Return the same coordinates if not changed within "wait_time" ms

    /*
        if (actual_coords_element.innerText == last_coords) {
            let wait_time = 4000;
            let interval_wait = 50;

            let should_stop = false;

            let new_int = setInterval(() => {

                // console.log(`running interval 2. left: ${wait_time}`);

                if (actual_coords_element.innerText != last_coords) {
                    clearInterval(new_int);
                    should_stop = true;
                } else if (wait_time == 0) {
                    clearInterval(new_int);
                    should_stop = true;
                }
                
                wait_time -= interval_wait;
            }, interval_wait);

            while (!should_stop) {
                await new Promise(r => setTimeout(r, interval_wait));
            }
        }

        console.log("finished last coords comp")

        actual_coords = actual_coords_element.innerText;

        if (actual_coords == "") {
            alert("Error: Could not load coordinates within 4 seconds");
            console.log("IIIIIIIIINV")
            return undefined;
        }

        
        console.log(`actual coords: ${actual_coords}`)

        last_coords = actual_coords

        return actual_coords

        */

    let actual_coords = actual_coords_element.innerText;

    if (actual_coords == "") {
      //alert("Error: Could not load coordinates within 4 seconds");
      return undefined;
    }

    return actual_coords;

    // }  //else if (found.length == 0) {
    //alert('Error: Could not find coordinates in card');
    //}
    //else {
    // alert('Error: Found more than button');
    // }
  }

  function find_streetview_image_url() {
    for (let i = 0; i < card.children.length; i++) {
      let child = card.children[i];
      if (child.style.backgroundImage.indexOf("streetview") != -1) {
        return child.style.backgroundImage.split('"')[1];
      }
    }

    return "none";
  }

  // Returns raw data from coordinates
  async function get_data(coordA, coordB) {
    let book = await bapi.runtime.sendMessage({ type: "get_bookmark", coordA: coordA, coordB: coordB })

    if (book.code != 200) {
      return book.code;
    }

    book = book.bookmark;

    let found_url = find_streetview_image_url()

    if (found_url != "none") {
      let streetview_id = found_url.split("=")[1].split("&")[0]
      book.streetview.google.before_id = "none"
      book.streetview.google.id = streetview_id
      book.streetview.google.after_id = "none"
      book.streetview.google.yaw = found_url.split("&")[4].split("=")[1]

      // let pitch = url.split(",")[5].split("t")[0]
      // book.streetview.google.streetview_pitch = pitch;
      // book.streetview.google.thumbnail_pitch = (180/-178 * (pitch)) + (180/178) + 90;

      book.streetview.google.thumbnail_pitch = found_url.split("&")[5].split("=")[1]
      book.streetview.google.fov = found_url.split("&")[6].split("=")[1]
    }

    return book
  }

  async function execute() {
    let coords = await get_coordinates();
    console.log("got coordinates");
    let coordA = coords.split(",")[0]; // S
    let coordB = coords.split(",")[1].trim(); // W

    is_actually_bookmarked = await bapi.runtime.sendMessage({
      type: "is_bookmarked",
      value: `${coordA}, ${coordB}`,
    });

    if (is_actually_bookmarked) {
      await bapi.runtime.sendMessage({ type: "remove_bookmark_from_coords", value: `${coordA}, ${coordB}`, shouldReload: true });
      is_actually_bookmarked = false;
      button.style.opacity = "0.5";
      button.onmouseleave = () => button.style.opacity = "0.5";
    } else {
      let data = await get_data(coordA, coordB);
      if (typeof data == "object") {
        // await bapi.runtime.sendMessage({ type: "execute", value: data });
        await bapi.runtime.sendMessage({ type: "add_bookmark", value: data, shouldReload: true });
        button.style.opacity = "1.0";
        button.onmouseleave = () => button.style.opacity = "1.0";
      } else if (typeof data == "number") {
        switch (data) {
          case 401:
            alert("The given API key is not valid. Please modify it to a valid one in the extension settings (cog icon in the top-right corner of the extension page).");
            break;
          case 400:
            alert(`Could not get API information from given coordinates. Invalid format?`)
            break;
          case 503:
            alert("Internal server error or your API/IP is blacklisted")
            break;
          default:
        }
        // alert("Error: Could not get data for current coordinates");
      } else {
        alert("Could not get data properly. Unknown cause.")
      }
    }
  }

  async function create_button() {
    // let placeholder_position = find_by_xpath(placeholder_position_xpath);
    let placeholder_position = card.children[0];

    if (placeholder_position != undefined && placeholder_position.tagName == "SPAN") {
      let wrapper = document.createElement("div");
      wrapper.id = "flex-wrapper-ext";
      wrapper.style =
        "display: flex; align-items: center; justify-content: center;";

      placeholder_position.parentNode.insertBefore(
        wrapper,
        placeholder_position
      );

      let new_button = document.createElement("button");
      new_button.id = "bookmark-btn";
      let star_img = bapi.runtime.getURL("assets/icons/star.png");

      new_button.onmouseenter = () => (new_button.style.opacity = "1.0");

      // let data = await get_data();
      let coordinates = await get_coordinates();

      /*
            await bapi.runtime.sendMessage({type: "logg"})
            let reso = await bapi.runtime.sendMessage({type: "teszt", value: "123"})
            console.log(reso)
            reso = await bapi.runtime.sendMessage({type: "get_bookmarks"})
            console.log(reso)
            */
      is_actually_bookmarked = await bapi.runtime.sendMessage({
        type: "is_bookmarked",
        value: coordinates,
      });
      console.log(`is actually bookmarked: ${is_actually_bookmarked}`);

      // Need to wait until get_data() returns

      // If the current coordinate is bookmarked (get_data check), opacity should be 1.0
      new_button.style = `background-image: url('${star_img}'); background-size: 100%; background-repeat: no-repeat; padding: 30px; margin: 5px; cursor: pointer; opacity: ${is_actually_bookmarked ? "1.0" : "0.5"
        }; width: 50px; height: 50px; transition: all 0.1s;`;
      new_button.onmouseleave = () =>
        is_actually_bookmarked
          ? (new_button.style.opacity = "1.0")
          : (new_button.style.opacity = "0.5");

      //placeholder_position.parentNode.insertBefore(new_button, placeholder_position.nextSibling)
      new_button.addEventListener("click", execute);
      button = new_button;


      /*
      button.addEventListener("onmouseenter", () => mouse_is_over_button = true);
      button.addEventListener("onmouseleave", () => {
        mouse_is_over_button = false;
        is_actually_bookmarked
        ? (button.style.opacity = "1.0")
        : (button.style.opacity = "0.5");
      });
      */

      wrapper.appendChild(button);

      is_open = true;
    } /*else if (placeholder_position.length == 0) {
            alert('Error: Could not find placeholder position for button with class " GaSlwc-uhFGfc-WsjYwc-HiaYvf" or "GaSlwc-uhFGfc-WsjYwc-LwH6nd"')
        } else {
            alert('Error: Fould multiple placeholders for button with class " GaSlwc-uhFGfc-WsjYwc-HiaYvf" or "GaSlwc-uhFGfc-WsjYwc-LwH6nd"')
        }*/
  }

  function delete_btn() {
    button.removeEventListener("click", execute);
    button.remove();
    button = undefined;
  }

  let printed = false;

  async function run_routinely() {
    // let found = document.getElementsByClassName('GaSlwc-uhFGfc-WsjYwc GaSlwc-uhFGfc-WsjYwc-open');
    // console.log("ok");
    // let found = find_by_xpath(open_card_xpath);
    let found = document.getElementById("reveal-card");

    if (found.className.split(" ").length == 2 && found.children.length == 1) {
      found = found.children[0];
    } else {
      found = null;
    }

    if (
      found != -1 && found != null && found.children.length > 0 &&
      (window.location.href.length < 110 && (window.location.href.indexOf("y,") == -1 || window.location.href.indexOf("t/data=") == -1))
    ) {

      // Popup was not there and has just popped-up
      if (!is_open) {
        card = found;
        await create_button();
      }

      let coordinates = await get_coordinates();

      let changed = false;
      let new_is_actually_bookmarked = await bapi.runtime.sendMessage({
        type: "is_bookmarked",
        value: coordinates,
      });

      if (new_is_actually_bookmarked != is_actually_bookmarked) {
        changed = true;
        is_actually_bookmarked = new_is_actually_bookmarked
      }

      // Need to wait until get_data() returns

      // If the current coordinate is bookmarked (get_data check), opacity should be 1.0

      if (changed) {
        button.style.opacity = is_actually_bookmarked ? "1.0" : "0.5";
        button.onmouseleave = () => is_actually_bookmarked ? button.style.opacity = "1.0" : button.style.opacity = "0.5";
      }

    } else if (
      found != -1 && found != null &&
      found.className.split(" ").length == 1 &&
      (window.location.href.length < 110 && (window.location.href.indexOf("y,") == -1 || window.location.href.indexOf("t/data=") == -1))
    ) {
      // Popup was there but was closed
      /*
      if (is_open) {
        //delete_btn();
      }
      */

      //is_open = false;
    } //else {
    //alert('Extension error at bookmarks.js file, found more than 1 element with classname "GaSlwc-uhFGfc-WsjYwc GaSlwc-uhFGfc-WsjYwc-open" ')
    //}

    if (window.location.href.length > 110 && window.location.href.indexOf("y,") != -1 && window.location.href.indexOf("t/data=") != -1) {
      clearInterval(interval_id);

      // Removes the Star bookmark button if it has been created
	  /*
      if (is_open) {
        delete_btn();
      }
	  */
	  // Button gets scraped automatically amidst the transition

      if (!streetview_is_setup) { maps_is_setup = false; setup_street_view_bookmark(); };
    }
  }
}

function setup_street_view_bookmark() {
  streetview_is_setup = true;
  let interval = 10; // Milliseconds
  let button = undefined;
  let btn_created = false;
  let old_url = undefined;
  let last_url = window.location.href;
  let last_id = get_details(last_url).id;
  let is_actually_bookmarked = false;
  let found = undefined;

  // let last_coords = undefined;

  //let placeholder_position_classname = "gzhbId";
  //let placeholder_position_xpath = "/html/body/div[3]/div[9]/div[12]/div[1]/div";

  // let found_classname = "P9uzfd-titlecard V2ucA";
  //let found_classname = "C5SiJf V2ucA";
  //let found_xpath = "/html/body/div[3]/div[9]/div[12]/div[1]";

  //let divider_classname = "Gt8Xw Hk4XGb";
  //let divider_xpath = "/html/body/div[3]/div[9]/div[12]/div[1]/div/div[2]";

  console.log("setup_street_view_bookmark()");
  let interval_id = setInterval(run_routinely, interval);

  let running = false;

  function get_coordinates(url) {
    let actual_coords = url.split("@")[1].split(",");
    actual_coords = `${actual_coords[0]}, ${actual_coords[1]}`;
    return actual_coords;
  }

  // Returns raw data from coordinates
  async function get_data(coordA, coordB) {
    let book = await bapi.runtime.sendMessage({ type: "get_bookmark", coordA: coordA, coordB: coordB })

    if (book.code != 200) {
      return book.code;
    }

    book = book.bookmark;

    console.log(`GOTTEN: ${JSON.stringify(book)}`)

    let url = window.location.href;
    url = url.split("?")[0]
    let fov = url.split(",")[3].replace("y", "")

    // Horizontal
    let yaw = url.split(",")[4].replace("h", "")


    let before_id = "none";
    let id = "none";
    let after_id = "none";

    if (url.indexOf("streetviewpixels") != -1) {
      id = url.split("%3D")[1].split("%26")[0];
      before_id = url.split("data=")[1].split(id)[0];
      after_id = url.split("http")[1].split("data=")[1].split(id)[1] + url.split("thumbfov")[1].slice(url.split("thumbfov")[1].indexOf("!"));
    }

    else if (url.indexOf("googleusercontent") != -1) {
      id = url.split("%2F")[4].split("%3D")[0];
      before_id = url.split("data=")[1].split(id)[0];
      after_id = url.split("http")[1].split("data=")[1].split(id)[1] + '!' + url.split("!")[8] + '!' + url.split("!")[9];
    }
    else {
      id = url.split("data=")[1];

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

      id = url.length < 145 ? id.slice(last_idx - 22, last_idx) : id.slice(last_idx - 44, last_idx)

      before_id = url.split("data=")[1].split(id)[0]
      after_id = url.split("data=")[1].split(id)[1]
    }



    book.streetview.google.before_id = before_id;
    book.streetview.google.id = id;
    book.streetview.google.after_id = after_id;
    book.streetview.google.fov = fov;

    // Vertical (1-180 ?) 
    // In the URL goes from 1 to 180
    // On the streetview api for thumbnails goes from -90 to 90 (although you can exceed this, the image will turn upside down
    // therefore they cap it on the streetview)
    // We need to convert the range from 1 to 180 to -90 to 90 through a linear equation
    // Closest is thumbnail_pitch(street_pitch) = 180/-178 * street_pitch + 180/178 + 90
    // Where thumbnail_pitch(1) = 90 | thumbnail_pitch(180) = -90
    let pitch = url.split(",")[5].split("t")[0]
    book.streetview.google.street_pitch = pitch;
    book.streetview.google.thumbnail_pitch = ((180 / -178 * parseFloat(pitch)) + (180 / 178) + 90).toString();
    book.streetview.google.yaw = yaw;

    console.log(`done book: ${JSON.stringify(book)}`)
    return book
  }

  async function execute() {
    // Does await wait only for the message to be delivered, or does it wait until the function returns?
    // Should wait until the function returns, not until the message returns
    let coords = (get_coordinates(window.location.href)).split(",");
    let coordA = coords[0];
    let coordB = coords[1].trim();

    is_actually_bookmarked = await bapi.runtime.sendMessage({
      type: "is_bookmarked",
      value: `${coordA}, ${coordB}`,
    });

    if (is_actually_bookmarked) {
      await bapi.runtime.sendMessage({ type: "remove_bookmark_from_coords", value: `${coordA}, ${coordB}`, shouldReload: true });
      is_actually_bookmarked = false;
      button.style.opacity = "0.5";
      button.onmouseleave = () => button.style.opacity = "0.5";
    } else {
      let data = await get_data(coordA, coordB);
      if (typeof data == "object") {
        // await bapi.runtime.sendMessage({ type: "execute", value: data });
        await bapi.runtime.sendMessage({ type: "add_bookmark", value: data, shouldReload: true });
        button.style.opacity = "1.0";
        button.onmouseleave = () => button.style.opacity = "1.0";
      } else if (typeof data == "number") {
        switch (data) {
          case 401:
            alert("The given API key is not valid. Please modify it to a valid one in the extension settings (cog icon in the top-right corner of the extension page).");
            break;
          case 400:
            alert(`Could not get API information from given coordinates. Invalid format?`)
            break;
          case 503:
            alert("Internal server error or your API/IP is blacklisted")
            break;
          default:
        }
        // alert("Error: Could not get data for current coordinates");
      } else {
        alert("Could not get data properly. Unknown cause.")
      }
    }

  }

  async function create_button() {
    // let placeholder_position = document.getElementsByClassName('P9uzfd-titlecard-HMhvwb');
    // let placeholder_position = find_by_xpath(placeholder_position_xpath)
    // let placeholder_position = find_by_xpath(found_xpath);
    let placeholder_position = found;

    if (
      placeholder_position != -1 && placeholder_position != null && placeholder_position != undefined
      // && placeholder_position.className.split(" ").length == 2
    ) {
      /*
            let divider = document.getElementsByClassName("P9uzfd-titlecard-clz4Ic noprint");
 
            if (divider.length == 1) {
                divider = divider[0];
                divider.remove();
            }
            */
	  if (placeholder_position.children.length < 2) {
		return false;
	  }
	  
	  placeholder_position = placeholder_position.children[1];

      let divider = placeholder_position.children[1];
      divider.remove();

      placeholder_position = placeholder_position.children[1];

      let wrapper = document.createElement("div");
      wrapper.id = "flex-wrapper-ext";
      wrapper.style = "display: flex; flex-direction: row;";

      placeholder_position.parentNode.insertBefore(
        wrapper,
        placeholder_position
      );

      wrapper.appendChild(placeholder_position);

      let new_button = document.createElement("button");
      new_button.id = "bookmark-btn";
      let star_img = bapi.runtime.getURL("assets/icons/star.png");

      new_button.onmouseenter = () => (new_button.style.opacity = "1.0");

      // let data = await get_data();
      let coordinates = get_coordinates(window.location.href);

      is_actually_bookmarked = await bapi.runtime.sendMessage({
        type: "is_bookmarked",
        value: coordinates,
      });

      // Need to wait until get_data() returns

      // If the current coordinate is bookmarked (get_data check), opacity should be 1.0
      new_button.style = `background-image: url('${star_img}'); background-size: 100%; background-repeat: no-repeat; padding: 15px; margin: 15px; cursor: pointer; opacity: ${is_actually_bookmarked ? "1.0" : "0.5"
        }; width: 50px; height: 50px; transition: all 0.1s;`;
      new_button.onmouseleave = () =>
        is_actually_bookmarked
          ? (new_button.style.opacity = "1.0")
          : (new_button.style.opacity = "0.5");

      //placeholder_position.parentNode.insertBefore(new_button, placeholder_position.nextSibling)
      new_button.addEventListener("click", execute);
      button = new_button;

      let new_wrapper = document.createElement("div");
      new_wrapper.id = "star-wrapper";
      new_wrapper.style =
        "display: flex; align-items: center; justify-content: center;";

      placeholder_position.insertAdjacentElement("afterend", new_wrapper);
      new_wrapper.appendChild(button);

      return true;
    } /* else if (placeholder_position.length == 0) {
            alert('Error: Could not find placeholder position for button with class " GaSlwc-uhFGfc-WsjYwc-HiaYvf" or "GaSlwc-uhFGfc-WsjYwc-LwH6nd"')
        } else {
            alert('Error: Fould multiple placeholders for button with class " GaSlwc-uhFGfc-WsjYwc-HiaYvf" or "GaSlwc-uhFGfc-WsjYwc-LwH6nd"')
        }
        */

    return false;
  }

  function get_details(current_url) {
    current_url = current_url.split("?")[0]
    let id = "";
    let before_id = "";
    let after_id = "";


    if (current_url.indexOf("streetviewpixels") != -1) {
      id = current_url.split("%3D")[1].split("%26")[0];
      before_id = current_url.split("data=")[1].split(id)[0];
      after_id = current_url.split("http")[1].split("data=")[1].split(id)[1] + current_url.split("thumbfov")[1].slice(current_url.split("thumbfov")[1].indexOf("!"));
    }

    else if (current_url.indexOf("googleusercontent") != -1) {
      id = current_url.split("%2F")[4].split("%3D")[0];
      before_id = current_url.split("data=")[1].split(id)[0];
      after_id = current_url.split("http")[1].split("data=")[1].split(id)[1] + '!' + current_url.split("!")[8] + '!' + current_url.split("!")[9];
    }
    else {
      id = current_url.split("data=")[1];

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

      id = current_url.length < 145 ? id.slice(last_idx - 22, last_idx) : id.slice(last_idx - 44, last_idx)

      before_id = current_url.split("data=")[1].split(id)[0]
      after_id = current_url.split("data=")[1].split(id)[1]
    }

    return { id: id, before_id: before_id, after_id: after_id }
  }

  async function run_routinely() {
    // console.log("z");
    // let found = document.getElementsByClassName('P9uzfd-titlecard P9uzfd-titlecard-ti6hGc-mvZqyf-hSRGPd');
    if (last_url != window.location.href && !running) {
      running = true;
      let current_url = window.location.href

      // details: { before_id: string, id: string, after_id: string }
      let details = get_details(current_url)


      // URL changed but panorama image id remained the same: Google updated the coordinates/url (therefore we should also update the bookmark)

      let old_coordinates = get_coordinates(last_url)
      let new_coordinates = get_coordinates(window.location.href)

      if (details.id == last_id && old_coordinates != new_coordinates && await bapi.runtime.sendMessage({ type: "is_bookmarked", value: old_coordinates })) {
        button.style.opacity = '0.5'

        let old_coordA = old_coordinates.split(",")[0]
        let old_coordB = old_coordinates.split(",")[1].trim()

        let old_bookmark = await bapi.runtime.sendMessage({ type: "get_stored_bookmark", coordA: old_coordA, coordB: old_coordB })
        // Need deep copy
        let new_bookmark = JSON.parse(JSON.stringify(old_bookmark))

        new_bookmark.coordinates.coordinate_degrees = new_coordinates;
        new_bookmark.coordinates.latitude_degrees = new_coordinates.split(",")[0]
        new_bookmark.coordinates.longitude_degrees = new_coordinates.split(",")[1].trim()


        // Leaving DMS coordinates the same as the API gives slitghtly different results compared to other sources
        // The small coordinate change when Google seems to update maps is not enough for a relevant change in the DMS coordinates

        new_bookmark.streetview.google.before_id = details.before_id;

        // Get new panorama/thumbnail ID from specific link element, as for some weird reason Google doesn't update
        // the Street View ID in the URL, despite updating other parts, such as the coordinates.
        links = document.querySelectorAll("a[href]");
        link = links[links.length - 1];
        link = link["search"];
        new_id = link.split("!")[2].split("&")[0].slice(2);
        new_bookmark.streetview.google.id = new_id;
        // new_bookmark.streetview.google.id = details.id;
        new_bookmark.streetview.google.after_id = details.after_id;

        await bapi.runtime.sendMessage({ type: "add_bookmark", value: new_bookmark, shouldReload: false })
        // Can have 2 bookmarks that point to the same place if interrupted here... Need a workaround
        await bapi.runtime.sendMessage({ type: "remove_bookmark", value: old_bookmark, shouldReload: true })

        // Update star
        button.style.opacity = '1.0';
        button.onmouseleave = () => button.style.opacity = '1.0';

      }

      last_url = current_url
      last_id = details.id

      running = false;
    }

    // let found = find_by_xpath(found_xpath);
    if (found == undefined) {

      // Don't need to call this every time, but for the sake of brevity...
      let titlecard = document.getElementById("titlecard");

      if (titlecard != null) {
        if (titlecard.children[0].attributes["role"] != undefined) {
          let to_be_found = titlecard.children[0];
          if (to_be_found.children.length >= 2 && to_be_found.children[0].tagName == "BUTTON" && to_be_found.children[1].tagName == "DIV") {
            found = to_be_found;
          }
        }
      }
    }


    // && found.className.indexOf("-titlecard") && .split(" ").length == 2
    if (
      found != -1 && found != null && found != undefined &&
      !btn_created &&
      (window.location.href.length > 110 && window.location.href.indexOf("y,") != -1 && window.location.href.indexOf("t/data=") != -1)
    ) {
      old_url = window.location.href.substring(0, 52);
      let res = await create_button();
      if (res) btn_created = true;
    }

    // If coordinates updated (moved in Street View)
    else if (
      (window.location.href.length > 110 && window.location.href.indexOf("y,") != -1 && window.location.href.indexOf("t/data=") != -1) &&
      btn_created &&
      window.location.href.substring(0, 52) != old_url
    ) {
      old_url = window.location.href.substring(0, 52);

      // let data = await get_data();
      let coordinates = get_coordinates(window.location.href);
      is_actually_bookmarked = await bapi.runtime.sendMessage({
        type: "is_bookmarked",
        value: coordinates,
      });

      // Need to wait until get_data() returns

      // If the current coordinate is bookmarked (get_data check), opacity should be 1.0
      button.style.opacity = is_actually_bookmarked ? "1.0" : "0.5";
      button.onmouseenter = () => button.style.opacity = "1.0";
      button.onmouseleave = () =>
        is_actually_bookmarked
          ? (button.style.opacity = "1.0")
          : (button.style.opacity = "0.5");
    }

    // If we remain on the same page without changes
    else if ((window.location.href.length > 110 && window.location.href.indexOf("y,") != -1 && window.location.href.indexOf("t/data=") != -1) &&
      btn_created &&
      window.location.href.substring(0, 52) == old_url) {

      let coordinates = get_coordinates(old_url);
      let changed = false;
      let new_is_actually_bookmarked = await bapi.runtime.sendMessage({
        type: "is_bookmarked",
        value: coordinates,
      });

      if (new_is_actually_bookmarked != is_actually_bookmarked) {
        changed = true;
        is_actually_bookmarked = new_is_actually_bookmarked
      }

      // Need to wait until get_data() returns

      // If the current coordinate is bookmarked (get_data check), opacity should be 1.0

      if (changed) {
        button.style.opacity = is_actually_bookmarked ? "1.0" : "0.5";
      }
    }

    if (window.location.href.length < 110 && (window.location.href.indexOf("y,") == -1 || window.location.href.indexOf("t/data=") == -1)) {
      clearInterval(interval_id);
      if (!maps_is_setup) { streetview_is_setup = false; setup_map_bookmark(); };
    }
  }
}

let streetview_is_setup = false;
let maps_is_setup = false;

if (url.length < 110 && (window.location.href.indexOf("y,") == -1 || window.location.href.indexOf("t/data=") == -1)) {
  setup_map_bookmark();
} else {
  setup_street_view_bookmark();
}
