# Table of contents

- [Important](#important)
- [About](#about)
- [Setting up the API](#setting-up-the-api)
- [How to use the extension](#how-to-use-the-extension)
  * [Bookmarking in Google Maps](#bookmarking-in-google-maps)
  * [Bookmarking in Google Street View](#bookmarking-in-google-street-view)
  * [Extension page](#extension-page)
  * [Resetting filters](#resetting-filters)
  * [Bookmarking in the extension page](#bookmarking-in-the-extension-page)
  * [Removing bookmarks in the extension page](#removing-bookmarks-in-the-extension-page)
  * [Exporting](#exporting)
  * [Importing](#importing)
- [How bookmarks are formatted and stored in JSON](#how-bookmarks-and-their-google-maps-street-view-data-are-formatted-and-stored-in-json)
  * [Google Street View bookmark](#google-street-view-bookmark)
    + [Thumbnail](#thumbnail)
  * [360 degree picture bookmark](#360-degree-picture-bookmark)
    + [Thumbnail](#thumbnail-1)
  * [Google Maps bookmark](#google-maps-bookmark)
    + [Its thumbnail](#its-thumbnail)
- [How the extension behaves](#how-the-extension-behaves)
- [Issues](#issues)
- [Notes](#notes)
- [Todo](#todo)
  * [Functionality](#functionality)
  * [Aesthetics (includes minor functionality)](#aesthetics--includes-minor-functionality-)
  * [Semantics](#semantics)
- [Useful links to improve/manage the extension](#useful-links-to-improve-manage-the-extension)

## Important

This extension uses the geolocation API at https://opencagedata.com to save bookmarks. You don't need it if you just want to import bookmarks saved from a JSON file. They have a free account quota available (2500 calls/day as of 10/29/2022). More details below in the section `Setting up the API`.

The extension works only on Firefox Nightly and Developer esditions, because you will need to set the flag `xpinstall.signatures.required` from `true` to `false`, and this setting only works in these variants. The extension doesn't work on Chrome, even though it theoretically should. More on why at the end of the `How the extension behaves` section.

## About
* If you don't care about how or why I made this extension, and just want to get it setup and ready to use or read technical details, skip this section.

This extension was made a couple of months ago, primarily because I have a hobby of going through Google Street View in places that interest me for whatever reason, and I used to save the URLs of the places that I found particularly interesting, inside text files. The other reason was that I have never made a browser extension, so I wanted to experiment with that.

Being my first browser extension and not knowing exactly how to get what I wanted to do at many times, this extension is full of workarounds, unnecessary lines of code and redundant code, that I now know how to improve as I've become familiarized with how certain things work. All of which can easily be refactored and become more concise, less bloated and more straightforward, as well as more consistent and with less bugs. 

However, since this is not meant to be a perfect browser extension and I've made it primarily for both personal usage and learning experience, I don't expect to make changes to this project soon enough, as I have other priorities.

I'm uploading this today (10/29/2022), and have fixed tons of critical issues, inconsistencies, and added small features that makes it easier for the end user over the last ~2 weeks to get it ready for Github, but 80% of what is being published has already been mostly finished and working well enough for the last ~3-4 months.

It is nowhere near polished enough to be published, has missing features and bugs. Not to mention a not very captivating user interface, but it's at the very least functional and serves its purpose. However, since it has been a while that I've made and have been using it without many issues, being my first browser extension and useful for me, I decided to upload it here.

Also, Google hasn't yet broken anything, which will eventually happen in the future as they update their services. So, be aware that if Google decides to update Google Maps/Google Street View, it will possibly break, depending on the changes made. The fix should be relatively simple if it doesn't change much, as simply updating the elements' selectors might suffice. Changes in the URL formatting/encoding might also break the extension.

## Setting up the API

This API is what allows the extension to separate bookmarks based on their geographic details, which is what it provides given the latitude and longitude as parameters.

***You can still use the extension without an API key. However, you won't be able to bookmark things yourself. You will need to import bookmarks from other people or ones that you've exported yourself.*** This is the only limitation if you don't have a valid API key set. More about exporting is explained in the `Exporting` section below.

A free account gives you a quota of `2500` calls per day (as of 10/29/2022), which should be more than enough for the average user. Everytime a bookmark gets added directly through Google Maps/Street View or from their URLs/coordinates in the extension page, a call is made to the API. Calls are made in the `get_bookmark` function in the `dist/scripts/background/main.js` file. Importing bookmarks from JSON data in the format that the extension exports (more at the `Export` section) does not make calls to the API, as the bookmarks are already set up, thus not needing an API key setup if that's all you need. You can sign up for a free account at https://opencagedata.com.

![extensionapisignup_before0](https://user-images.githubusercontent.com/35003248/198834774-b8beb204-c1db-47a1-a648-9f5cac2613f2.png)
![extensionapisignup_before1](https://user-images.githubusercontent.com/35003248/198834776-837663f1-0021-45ab-8fa4-2a0b3223fdff.png)

After creating your account, your API key may now be available at https://opencagedata.com/dashboard#geocoding. If it isn't, in the `Geocoding API` tab, click the `Create another API key` button to generate an API key for you.

![extensionapisignup_after1](https://user-images.githubusercontent.com/35003248/198834785-8c843ff4-2e6e-4084-8e44-6b3c71d128ad.png)
![extensionapisignup_after2](https://user-images.githubusercontent.com/35003248/198834789-c1f72bae-ffe4-428e-88c5-f5c57cc2b73d.png)

Now that you have your API key, you need to update it in the extension page. Click the extension icon in the browser, then after the page loads up, open the settings (click the cog icon in the top-right corner).

![extensionsettings_before](https://user-images.githubusercontent.com/35003248/198834795-252a38b0-8b7a-470a-9a9d-614e8f982216.png)

Then, all you have to do is paste the API key in the textbox and click the `Update` button. If your key is not valid (i.e. wrong key, blacklisted, api server is unreachable), you will be warned and the extension won't update it.

![extensionsettings_after](https://user-images.githubusercontent.com/35003248/198834808-15592811-8445-470d-9469-c50546c47c77.png)

## How to use the extension

This extension allows you to "bookmark" street locations from Google Maps (cannot bookmark places that are not street/empty land coordinates, i.e. cities themselves, hotels, hospitals, landmarks, neighbourhoods, etc.) and Google Street View, which are then stored in the extension page (which you can get to by clicking the extension in the add-on bar) as cards  in hierarchical format (starting from continents up to streets; each card click goes deeper into the hierarchy). The parsing and storage of the bookmarks is done with JSON.

### Bookmarking in Google Maps

In order to bookmark a location in Google Maps, you have to click somewhere that is not a building or the name of a location. Basically you have to either click in an empty space or in a street, and be careful not to click on a building instead, because this won't work. If you've correctly clicked a bookmarkable location, a card will pop up in the center-bottom of the screen with a faded star icon. If you click that star, the location will then be bookmarked. If the star is not faded, this means that the selected location is already bookmarked, and you can remove it by clicking on the star once again.

![googlemaps_example](https://user-images.githubusercontent.com/35003248/198834825-34fe039e-87f8-4d45-9404-8a6c0c85dc70.png)

Clicking on any of the names on display would not work, and the marker would turn red. Be careful not to click on buildings, as it has the same behavior.

### Bookmarking in Google Street View

To bookmark a location in Google Street View, all you will have to do is simply click the faded star, just like in Google Maps, it has the same behavior. Except that the star icon is at the top-left corner of the screen alongside Google's card with information about the location, instead of at the center-bottom. If the extension is working as intended, the star should always be there.

![streetview_example](https://user-images.githubusercontent.com/35003248/198834830-6a42c1d5-0e76-4675-b83c-ff013e9fb203.png)

### Extension page

![extensionpage](https://user-images.githubusercontent.com/35003248/198834837-1b489e62-82cb-4d4a-9e96-26a86f0f4537.png)

### Resetting filters

As searching has not yet been implemented, you can only go back and forth. By clicking in a card and increasing a level, and by clicking the left arrow in the top-left corner and decreasing a level. You can click the home button to go straight to the top.

![extensionmoving](https://user-images.githubusercontent.com/35003248/198834842-d5b7c6fe-0804-4764-ba39-f70a41a1248e.png)

### Bookmarking in the extension page

You can bookmark a location from its Google Maps/Street View URL or its coordinates, by clicking the bookmark button.

![extensionbookmark_pre](https://user-images.githubusercontent.com/35003248/198834846-f9f41a7d-2d1d-4ed9-b911-6b319730efad.png)

In the modal that opened up, you can input the Google Maps/Street View URL or its coordinates, then click `ADD` to bookmark it. If trying to add by coordinates, you have to input the latitude and longitude, respectively, separated by a comma or whitespace.

![extensionbookmark_after](https://user-images.githubusercontent.com/35003248/198834853-0ce474d4-1dfe-435c-8dda-f7ac7da1f695.png)

### Removing bookmarks in the extension page

You can remove a specific bookmark or all child bookmarks (bookmarks inside a given location) by hovering over the card and clicking the "X" icon in the top-right corner. If the card clicked has children, a prompt will pop up asking whether you want to proceed while showing you how many bookmarks will be removed.

![extensiondelete_pre](https://user-images.githubusercontent.com/35003248/198834863-b1490dd2-0447-4ac5-a1b5-64f83f8537a1.png)
![extensiondelete_after](https://user-images.githubusercontent.com/35003248/198834870-76ce0a83-6b07-4dd5-a558-d50e18105bfd.png)

### Exporting

You can export the bookmarks to a JSON file, by clicking the icon with an arrow down.

![extensionexport_pre](https://user-images.githubusercontent.com/35003248/198834879-7ccd6a45-1d74-4f3f-a2f7-9dd9bf55157e.png)

It opens up a modal where you can either download the JSON formatted file containing the bookmarks or copy/read the text itself.

![extensionexport_after](https://user-images.githubusercontent.com/35003248/198834885-a3a8ad73-fc5c-4e14-99e2-32b0f1d95fc0.png)

### Importing

You can import (optionally replace) bookmarks, by clicking the paper icon with an addition sign.

![extensionimport_pre](https://user-images.githubusercontent.com/35003248/198834891-8d40c21b-7546-49eb-87c1-066fd0433b55.png)
![extensionimport_after1](https://user-images.githubusercontent.com/35003248/198834897-3c39f385-abe5-4552-ba6d-84ebf0d7b156.png)

It opens up a modal that allows you to import however many bookmarks you want, both in JSON format (as exported by the extension) or as URLs separated by newlines. You can also optionally replace the preexisting bookmarks by checking the `Replace All` box.

The data to be imported in the picture above uses the format that the extension exports, therefore it already includes the bookmarks with their respective details, so no calls to the API are necessary, and thereby you don't need an API key to import bookmarks like this.

![extensionimport_after2](https://user-images.githubusercontent.com/35003248/198834903-ea6dd6cc-4eb2-487c-b72c-0b2da3b2a949.png)

In this case, you're bookmarking the URLs from scratch as if you were going through them one by one, which clearly doesn't contain any extra information, and as such, calls to the API have to be made and you need a valid API key set in this case. Unlike in the example above.

## How bookmarks and their Google Maps/Street View data are formatted and stored in JSON
***You can find an example JSON export with ~558 bookmarks in the `bookmarks_example.json` file. All you have to do is import it.*** The thumbnail pitch is slightly wrong in this example file, but the cause for that has already been fixed.

Calls to the API are made in the following format: `https://api.opencagedata.com/geocode/v1/json?q=LAT+LNG&key=YOUR-API-KEY`. Where `LAT` is the latitude coordinate, `LNG` is the longitude coordinate and `YOUR-API-KEY` is, well, self-explanatory.

The following JSON data is an example of how the bookmarks are saved in the extension's local storage. 

```
[{
    "confidence": 10,
    "coordinates": {
        "coordinate_degrees": "-29.6974533, -53.7930744",
        "latitude_degrees": "-29.6974533",
        "longitude_degrees": "-53.7930744",
        "coordinate_DMS": "29° 41' 50.68824'' S, 53° 47' 34.54908'' W",
        "latitude_DMS": "29° 41' 50.68824'' S",
        "longitude_DMS": "53° 47' 34.54908'' W"
    },
    "currency": {
        "currency_representation": "R$",
        "currency_abbreviation": "BRL",
        "currency_name": "Brazilian Real"
    },
    "location": {
        "continent": "South America",
        "country": "Brazil",
        "region": "South Region",
        "state": "Rio Grande do Sul",
        "state_code": "RS",
        "state_district": "Região Geográfica Intermediária de Santa Maria",
        "municipality": "Região Geográfica Imediata de Santa Maria",
        "city": "Santa Maria",
        "suburb": "Nossa Senhora de Lourdes",
        "road": "Rua Engenheiro Luiz Bollick",
        "postcode": "97050-210",
        "formatted": "Rua Engenheiro Luiz Bollick 330, Nossa Senhora de Lourdes, Santa Maria - RS, 97050-210, Brazil",
        "neighbourhood": "Vila Elwanger"
    },
    "time": {
        "timezone": "America/Sao_Paulo",
        "offset": "-0300",
        "abbreviation": "BRT"
    },
    "flag": "🇧🇷",
    "two_letter_cc": "BR",
    "three_letter_cc": "BRA",
    "calling_code": 55,
    "streetview": {
        "google": {
            "before_id": "!3m6!1e1!3m4!1s",
            "id": "aJNKCShn4mJGvIBXGWGA8A",
            "after_id": "!2e0!7i16384!8i8192",
            "yaw": "325.23",
            "fov": "90",
            "street_pitch": "87.63",
            "thumbnail_pitch": 2.39662921348
        }
    }
}]
```
Keys that contain geographical information about the location itself are pulled from the Opencagedata API (which returns information from parameterized coordinates), while data pertaining to Google Maps/Street View is decoded by the extension from their URLs. In this example there is a single bookmark, which starts and ends at the first and last curly brackets, respectively. All bookmarks are stored inside this array. All keys, except the `streetview` key, are retrieved from the Opencagedata API.

Explanation of the `streetview` key:

`google` - The category of the Street View. In this case, its used only for bookmarks from Google services (i.e. Google Maps/Street View/360 degree Pictures). Currently only Google is supported, so this will always be the case, however, in the future there could be other services supported, and this key would be replaced with the given service (i.e. Naver maps (South Korea), Baidu maps (China), Yandex maps (Eastern Europe/Middle east), etc.).

In order to better understand the keys for Google, and how they encode the URLs, here is some explanation of how the URLs (Street View and thumbnail) were constructed from this JSON example: 

### Google Street View bookmark

Whenever this bookmark is clicked in the extension, the browser opens a new tab with the URL https://www.google.com/maps/@-29.6974533,-53.7930744,3a,90y,325.23h,87.63t/data=!3m6!1e1!3m4!1saJNKCShn4mJGvIBXGWGA8A!2e0!7i16384!8i8192.

These are the URLs you will get when bookmarking in Street View:

 * When you first enter the Street View - https://www.google.com/maps/@-29.6974533,-53.7930744,3a,90y,325.23h,87.63t/data=!3m7!1e1!3m5!1sOrtigdty4Nyl9U2VdzuSVg!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fpanoid%3DOrtigdty4Nyl9U2VdzuSVg%26cb_client%3Dmaps_sv.tactile.gps%26w%3D203%26h%3D100%26yaw%3D222.0353%26pitch%3D0%26thumbfov%3D100!7i16384!8i8192 
 
 * When you move in the street/click somewhere - https://www.google.com/maps/@-29.6974533,-53.7930744,3a,90y,325.23h,87.63t/data=!3m6!1e1!3m4!1saJNKCShn4mJGvIBXGWGA8A!2e0!7i16384!8i8192
 
 (Both will work)
<br>
`https://www.google.com/maps/@` - All Google Maps/Street View URLs start with this
<br>
`-29.6974533,-53.7930744` - The coordinates (latitude and longitude, respectively)
<br>
`3a,90y,325.23h,87.63t`:

* `3a` - I don't know what this does. It seems to be `3a` regardless of the location in Street View, so I don't touch this.
* `90y` - This is the fov (field of view). In this case, it is set to `90`. Its range is `[15,90]`, where `15` is the most zoom, and `90` the least zoom. Bypassing these limits through the URL parameters defaults the FOV to `75`. This value is stored in the `fov` key.
* `325.23h` - This is the yaw (rotation across the vertical axis, i.e. how rotated to the left/right the image is). In this case it is set to `325.23`. Its range is `[0,360]`. If the value is `0`, this parameter doesn't need to be included in the URL. If the value is outside of the range, it gets reset to what it was before the modification. This is the value stored in the `yaw` key.
* `87.63t` - This is the pitch (rotation in a front-to-back manner, i.e. how rotated up/down the image is). In this case it is set to `87.63`. Its range is `[1,179]`, where `1` is aiming at floor, and `179` aiming at the sky. Like yaw, if the value is outside of the range, it gets reset to what it was before the modification. This is the value stored in the `street_pitch` key.
* `!3m6!1e1!3m4!1s`, `!2e0!7i16384!8i8192` - These are, respectively, added before and after the Street View ID. These are probably related to flags set by the Google Maps API whenever a response is received. I don't know exactly what they do. They are respectively stored in the keys `before_id`, `after_id`.
* `aJNKCShn4mJGvIBXGWGA8A` - This is the ID of the given Street View location. It goes in between the encoded delimiters above. Seemingly, each Street View has its own ID, and they're very different from each other, so I assume this is hashed and has no correlation with the location itself. This always has to be included in the URL of the location, alongside the latitude/longitude coordinates. It's always made up of 22 characters. This is stored in the `id` key.

`90y` in Street View is equivalent to `thumbfov=90` in the thumbnail.

`325.23h` in Street View is equivalent to `yaw=325.23` in the thumbnail.

`87.63t` in Street View is equivalent to `pitch=2.39662921348` in the thumbnail.

Note, however, that they have different ranges. `[1,179]` on Street View and `[90,-90]` for the thumbnail. As such, we need to normalize it. This is the linear equation I came up with to translate the Street View pitch into the thumbnail's: `(180/-178 * pitch) + (180/178) + 90`. It can be simplified, but it is more readable this way. Basically, this function (roughly) maps the range `[1,179]` to `[90,-90]` while taking some caveats into account. This value is stored in the `thumbnail_pitch` key.

The parameters are inserted as such: 

`https://www.google.com/maps/@` + 
`${bookmark.streetview.google.coordinate_degrees}` +
`,3a,` +
`${bookmark.streetview.google.fov}` +
`y,` +
`${bookmark.streetview.google.yaw}` +
`h,` +
`${bookmark.streetview.google.pitch}` +
`t/data=` +
`${bookmark.streetview.google.before_id}` +
`${bookmark.streetview.google.id}` +
`${bookmark.streetview.google.after_id}`

#### Thumbnail

https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=aJNKCShn4mJGvIBXGWGA8A&cb_client=search.revgeo_and_fetch.gps&w=150&h=150&yaw=325.23&pitch=2.39662921348&thumbfov=90

This is the URL of the image used as the background of this example bookmark in the extension page, as a thumbnail.

`panoid` - ID of the panoramic image of the given Google Maps/Street View bookmark. In this case it is `aJNKCShn4mJGvIBXGWGA8A`. This value is retrieved from the `id` key.

`w` - Width of the resulting thumbnail. In this case it is `150`. It doesn't need to be proportional to the height. The maximum value is `1024px`. This will always be `150`, as I have hardcoded this.

`h` - Height of the resulting thumbnail. In this case it is `150`. It doesn't need to be proportional to the width. The maximum value is `576px`. This will always be `150`, as I have hardcoded this.

`yaw` - Amount of rotation across the vertical axis, i.e. how rotated to the left/right the image is. One full rotation has range `[0,360]`. There's no restriction, however. Negative values are also allowed. In this case, it is `325.23`.  This value is retrieved from the `yaw` key.

`pitch` - Amount of rotation in a front-to-back manner, i.e. how rotated up/down the image is.  One full rotation has range `[90,-90]`, where `90` aims at the floor and `-90` at the sky. There's no restriction, however. In this case, it is `2.39662921348`. This value is retrieved from the `thumbnail_pitch` key, which undergoes a linear transformation in order to be mapped from `[1,179]` to `[90,-90]`.

`thumbfov` - Fov (field of view) of the resulting thumbnail. In this case it is `90`. The allowed range in Street View is `[15,90]`, however, the restriction here is `[0,175]`. Where `0` is the most zoom and `175` is the least zoom. This value is retrieved from the `fov` key.

### 360 degree picture bookmark

This is actually not in the example bookmark above. The bookmark above is from a Street View URL, not a 360 degree picture. 

However, the same principles apply here. They're not that different. The URL of a 360 degree picture is very similar to the URL of an average Street View location, the most relevant difference is the length of the panorama's ID. For Street View, the length is 22 characters, whereas for 360 degree pictures it's 44 characters.

Here's an example ID of an image in Belarus: `AF1QipN_GdGo8lqN-gDVG3cpJdNLDRGHawOqfMfOprMi`
This one in Rio: `AF1QipOVIfdCT-QdUhyFNZP_Z9hrDbPCBSUpZQdbxxIE`

If you pay attention, you will notice that the first 4 characters are the same. This seems to always be the case, meanwhile the rest of the ID remains ever changing. I don't know what this is for.

#### Thumbnail

https://lh5.googleusercontent.com/p/AF1QipMowgvmpvd6Qu2IJT566SkOGSKq6eSIC6E5CjBj=w150-h150-k-no-pi-0-ya55-ro-0-fo100

The other difference is that the server where we get the thumbnail is not the same as Street View.

This is the URL of the image used in the background of a bookmark's card in the extension page, as a thumbnail. Here, inputing invalid parameters, unlike the Street View thumbnails, gives you a bad request.

As you can see below, you are allowed to manually request images of up to `16383x16383` pixels, which are huge, and might unnecessarily overload their servers (something an attacker can eventually pry on), as ideally only Google servers and people with a private API key should be allowed to call these to such an extent. That's what I assume at least, given Google charges for access to their APIs, including Google Maps. Therefore, Google maybe should take a second look at this from a security standpoint, then ideally standardize and sanitize their input in regards to these APIs, and/or decrease the limit of the allowed dimensions of the requested image from any call that doesn't come from Google themselves or has from someone who has a private API key.

The id of the panoramic image in the given picture starts after `/p/` and ends before the equal sign. In this case it is `AF1QipMowgvmpvd6Qu2IJT566SkOGSKq6eSIC6E5CjBj`.

`w` - Width of the resulting thumbnail. In this case it is `150`. It doesn't need to be proportional to the height. The maximum value is `16383px`.

`h` - Height of the resulting thumbnail. In this case it is `150`. It doesn't need to be proportional to the width. The maximum value is also `16383px`.

`pi` - The pitch. Amount of rotation in a front-to-back manner, i.e. how rotated up/down the image is.  One full rotation has range `[90,-90]`, where `90` aims at the floor and `-90` at the sky. In this case it is `-0`.

`ya` - The yaw. Amount of rotation across the vertical axis, i.e. how rotated to the left/right the image is. One full rotation has range `[0,360]`. In this case it is `55`.

`fo` - The fov (field of view). In this case it is `100`. The allowed range here is `[5,175]`. Where `5` is the most zoom and `175` is least zoom.

### Google Maps bookmark

If the bookmarked example above were a Google Maps bookmark, the URL that opens up will be https://www.google.com/maps/@-29.6974533,-53.7930744,19z. This opens up Google Maps centered at the given coordinates (which pertain to the respective bookmark) at zoom level `19`.

I have harcoded this zoom value, but Google Maps' range for zoom is `[3,21]` where `3` is the least zoom and `21` is the most zoom, and it refers to the `19z` in the URL, where the letter `z` intuitively stands for zoom.

#### Thumbnail

A Google Maps bookmark will only contain a thumbnail if you've bookmarked it from a road in Google Maps which contains a valid thumbnail in the card that pops up.

![extensionthumbnail](https://user-images.githubusercontent.com/35003248/198834927-0db26e14-a5ee-4165-ac3a-a33934ff2cb7.png)

If this is the case, the details about the thumbnail API are the exact same as the Street View above, since they use the same server.

## How the extension behaves

In order to check updates to the Google Maps/Street View page and the URL itself, the script calls a function every `10ms`. It runs `100` times a second. Which is quite a lot, however, since it only performs simple checks, it shouldn't generally heavily impact performance. You can change this value in the content script at `dist/scripts/content/main.js` just below the `setup_map_bookmark` and `setup_street_view_bookmark` function definitions, through the `interval` variable.

These functions check for URL changes in order to keep track of whenever the user moves inside Street View to another location, goes back to Google Maps, and vice versa. It also updates the bookmark star accordingly in the open Google Maps/Street View page(s) if the user adds/removes the bookmark through the extension page.

Whenever a bookmark is added/removed, the extension page (if it's open and is there aren't multiple tabs of the extension page open) will refresh itself and go back to the top of the hierarchy.

Given the asynchronous nature of these functions, and me not really spending much time on preventing them, eventually race conditions may occur.

As I haven't sent the extension to be signed by Mozilla, and Firefox only allows you to install signed extensions by default, the Firefox flag `xpinstall.signatures.required` has to be set to false. This setting only works on the **Nightly** and **Developer** editions of **Firefox**. The extension is currently functional (as of 10/29/2022, Firefox Nightly 108.0a1).

Although the code in principle should theoretically work cross-browser, it doesn't work on Chrome. (The browser specific API has been abstracted to the `bapi` variable instead of `chrome` for Chrome and `browser` for Firefox). 

I don't know the exact reason why it doesn't. The error message displayed by the browser is `Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'then')`, and it says that the exception is thrown at the function `set_storage` in `dist/scripts/background/main.js`, on the line `bapi.storage.local.set(obj).then(resolve(null))`.

Upon quick investigation, the function `set`, which supposedly returns an undefined value, is actually ran, and as such, the only possible case for this exception to occur is if it does indeed return undefined.
However, weirdly enough, even if this line is removed or commented out, the extension still throws the same error at the same line. As it doesn't make sense to me and I was/am not keen on spending too much time on fixing this for now, I just gave up on Chrome support, since it works on Firefox and the error is really weird. Maybe I will revisit this in the future, maybe not.

## Issues

- Sometimes the bookmark star icon may disappear and/or stop working properly after clicking somewhere that you're not supposed to. Meaning a location that's not a road/unlabeled land (i.e. gray square building, name of neighbourhood, city, country, hospital, supermarket, etc. Basically anything that turns the Google Maps marker red). Reloading Google Maps with its base (maps.google.com) address resets the content script and it will probably work again.
<br>
- This extension was made and tested on a 2560x1440 monitor, therefore overflows and other visual glitches are to be expected in different resolutions. Even in the same resolution as well;
<br>
- In the extension page, the bookmark, download, and add buttons, as well as the search bar, are not perfectly aligned;
<br>
- One time I was checking something out in South Korea's Street View, and the script didn't work correctly. I noticed that it had something to do with the coordinates in the URL not changing despite moving to another location. So, be aware that this may occur and break the bookmarking script until the page is reloaded;
<br>
- Whenever you remove/add a bookmark through Google Maps/Street View, the extension page is meant to reload. However, if you have multiple tabs of the extension page open, only one of them will reload and update, while the other ones remain unchanged until you refresh the page. It seems to be the case that it is always the tab that's the leftmost.

## Notes

- Sometimes, Google updates the Street View location with new coordinates/identifiers, so when you open it from the extension, Google recognizes that it used to be an old URL and updates it to the new one. At this point, the extension does not recognize the new location as having already been bookmarked, since it has different coordinates. What I did to mitigate this was check if the URL has changed, and if that is the case, and the new URL is indeed a redirection from the old URL, the old bookmark gets replaced with the new one. I needed an workaround to get the new panorama ID, as for some reason, Google does not update the panorama ID in the URL, while they do with the coordinates, weirdly enough. There's an anchor element in the page that contains a reference to an URL that uses the correct panorama ID, so that's where I get it from;
<br>
- Search bar and "Favorites" tab not yet implemented;
<br>
- Race conditions might occur while on Google Maps/Street View, as the function that keeps track of updates runs `10` times a second. More specifically, if another iteration of the function starts while the other hasn't yet returned, as there's a set time interval for the spawn of a new one. There also nested timed functions inside of ofther timed functions;
<br>
- The bookmarked location's thumbnail is only available in the extension page if it was bookmarked through Google Street View/360 Degree Pictures. And Google Maps  only if the card that pops-up contains a thumbnail, as we need to query Google's servers for an ID which is supplied only in these occasions;
<br>
- Adding a bookmark reloads the extension page instead of updating the contents of the page themselves;
<br>
- When bookmarking a bulk of locations from Street View URLs through the import section in the extension page, you will not be notified of bookmarks that were not added due to errors, they are ignored. I haven't implemented any way of properly logging errors to users, and opening an alert for every error that occurs in a list that may contain dozens or more bookmarks that are either valid or invalid is unfeasible;
<br>
- The easiest way to remove a bookmark saved from Google Maps is to manually delete it in the extension page, as Google Maps is much more precise with coordinates than Street View (because in Google Maps you can click anywhere, whereas Street View restricts you), so clicking somewhere very close to the bookmarked location will not be enough, it has to be the exact point that you've bookmarked. While in Street View just moving is likely sufficient, as the steps are relatively constant. There are exceptions though, particularly when switching from or to a Street View image that was taken in a different drive (i.e. different months, years). Happens most frequently in crossings.

## Todo

### Functionality

- Implement search;

- Add more options in the settings;

- Implement favorites tab: A tab intended to serve as another space where you can store your already saved bookmarks, based on your personalized hierarchies (i.e. bookmarks from different continents/countries/cities in the same section, where the section can have any name supplied by the user, with nesting allowed);

- Support other map sources instead of solely Google's. For example: Naver (most Korea coverage), Baidu (most China coverage), Yandex (most Eastern European/Middle eastern coverage). I had a quick look a long time ago before making this, and at the time you were able to get a Naver Maps' Street View latitude and longitude from an XHR request coming through the `Network` tab in the developer tools of a browser, this can be a starting point;

- Instead of reloading the bookmarks page everytime a new bookmark is added, just update the saved bookmarks and the array available to display;

- Store thumbnails locally once they've been downloaded, instead of having to load them from a remote server every time a street is displayed. Roughly 5-10 kilobytes per thumbnail;

- Add Google Drive synchronization support to update cloud backup of the bookmarks whenever one is added/removed, periodically (determined by the user's settings), or only when a sync button is clicked;

- Query other APIs and display extra information about the location in the extension page, as well as through an UI overlay on Google Maps/Street View, which includes current temperature, average yearly temperatures, yearly precipitation, city/neighbourhood population, and more. Add "information" icon to the extension page/bookmark which will trigger a pop-up containing this information about the selected location;

- Localize the text;

- It would be nice if there was an API that could give us accurate enough median house prices for the neighbourhood on display, as well as cost of living... And with at least some quotas for free...? But unfortunately this is probably a fairly utopic desire, as most countries/regions would not have enough data, let alone accurate.

### Aesthetics (includes minor functionality)

- Standardize sizes and resizes of various elements and text, accounting for zoom, different resolutions, pseudo element sizes, and get rid of hardcoded measures;

- Pick a default color palette/theme and allow user customization;

- Display how many calls to the Opencagedata API have been made in the last 24 hours (or the current day, depending on when the API resets), so as to not forget about the 2500 limit (if your account is free), then disable bookmarking if the limit has been reached;

- Loading animation (maybe a circular spiral animation) alongside text that says "Saving...", when saving bookmarks, both on Google Maps/Street View and on the extension page, while overlaying the whole page in the meantime;

- When importing bookmarks from a list through the extension page, inform the user of the progress by displaying how many bookmarks have already been saved and how many remain ("x out of y bookmarks saved." and "y - x bookmarks remaining" after a new line);

- If other map sources have been implemented, indicate which street view application was used (i.e. Baidu, Google, Naver, Yandex);

- Add tooltips to buttons informing the user of its basic functionality (i.e. "Bookmark", "Import", "Export", "Settings").

### Semantics

- Remove obsolete comments (there are many comments that stem from removed/updated code);

- Standardize variable names;

- Comment code.

## Useful links to improve/manage the extension

VUE content - https://github.com/vuejs/awesome-vue

Color palettes - https://www.color-hex.com/color-palette/5361

Pseudo-element size calculation - https://stackoverflow.com/questions/23248565/javascript-get-height-of-pseudo-before-element

Firefox addon policies - https://extensionworkshop.com/documentation/publish/add-on-policies/

Distributing (signing) the addon - https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/#distributing-your-addon

Updating Firefox addon - https://extensionworkshop.com/documentation/manage/updating-your-extension/

Building a cross-platform browser extension for Manifest V2 - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Build_a_cross_browser_extension

Modifying pseudo-elements on the fly through Javascript - https://stackoverflow.com/questions/21032481/change-the-style-of-before-and-after-pseudo-elements

Reference for storing bookmarks on Google Drive storage - https://github.com/cnwangjie/better-onetab/blob/master/src/common/service/gdrive.js