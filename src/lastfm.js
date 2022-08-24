(async function lastFmInfo() {

    const { CosmosAsync, Platform } = Spicetify;

    const LFMApiKey = '83fb76a887a860800fd8719bd7412ada'
    
    let RegisteredUsername = "Register username";
    
    let addLoginContainer;
    let addSongContainer;

    if (!Platform) {
        setTimeout(lastFmInfo, 300);
        return;
    }
    
    if (Spicetify.LocalStorage.get("lastFmUsername") !== null) {
        RegisteredUsername = JSON.parse(Spicetify.LocalStorage.get("lastFmUsername")).userName;
    }

    async function getLocalStorageData(key, fallback) {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    };

    async function validateLocalStorage() {
        if (!await getLocalStorageData(`lastFmUsername`)) {
            alert("You need to add the username first! \nUser > Last.fm Stats > Register Username");
            return;
        }
    }

    async function setLastFmUsername() {

        const MODAL_TITLE = "Connect Last.Fm Account";

        const triggerModal = () => {
            Spicetify.PopupModal.display({
                title: MODAL_TITLE,
                content: addLoginContainer
            });
        };

        if (addLoginContainer) {
            triggerModal();
            return;
        }
        addLoginContainer = document.createElement("div");
        const loginContainer = document.createElement("div");
        loginContainer.setAttribute('id', 'login-global-div')
        loginContainer.setAttribute('style', 'padding-bottom: 10%')
        const loginText = document.createElement("div");
        loginText.innerText = `Enter your Last.FM username`
        const nameInput = document.createElement("input");
        nameInput.style.cssText = 'display:flex;flex-direction: column;padding:15px; border-radius:15px; border:0; box-shadow:4px 4px 10px rgba(0,0,0,0.06);'
        nameInput.placeholder = RegisteredUsername;
        nameInput.required = true;
        loginContainer.appendChild(nameInput);

        const submitBtn = document.createElement("button");
        submitBtn.innerText = "Save";
        submitBtn.setAttribute('style', 'background-color: var(--spice-button);border-radius: 8px;border-style: none;box-sizing: border-box;color: #FFFFFF;cursor: pointer;display: inline-block;font-family: "Haas Grot Text R Web", "Helvetica Neue", Helvetica, Arial, sans-serif;font-size: 14px;font-weight: 500;height: 40px;line-height: 20px;list-style: none;margin: 0;outline: none;padding: 10px 16px;position: relative;text-align: center;text-decoration: none;transition: color 100ms;vertical-align: baseline;user-select: none;-webkit-user-select: none;touch-action: manipulation;}.button-1:hover,.button-1:focus {background-color: #1DB954;')
        submitBtn.addEventListener("click", function (event) {
            event.preventDefault();
            const name = nameInput.value.replace(/\n/g, "");

            if (name === "" || !name) {
                alert("The username can't be blank")
                return;
            }

            localStorage.setItem(`lastFmUsername`, JSON.stringify({
                userName: name,
            }));

            Spicetify.PopupModal.hide();
        }, false);

        loginText.style.cssText = 'padding-bottom: 10%;'
        loginContainer.appendChild(loginText);

        addLoginContainer.append(
            loginText,
            loginContainer,
            submitBtn,
        );

        triggerModal();
    }

    async function fetchSong(song_id) {
        const resp = await CosmosAsync.get('https://api.spotify.com/v1/tracks/' + song_id);
        return { artist: resp.artists[0].name, name: resp.name, image: resp.album.images[0].url}
    }

    async function fetchTrackInfo(artist, songName, lastFmUsername) {
        const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LFMApiKey}&artist=${artist}&track=${songName}&format=json&username=${lastFmUsername}`
        const initialReq = await fetch(url)
        const res = await initialReq.json();
        return res
    }

    async function createTrackModal(song_image, song_name, trackInfo) {
        const modalTitle = `Stats for ${song_name}`;
        const tagsList = trackInfo.track.toptags.tag.map(obj => obj.name);
        addSongContainer = document.createElement('div')

        // Global div
        const globalDiv = document.createElement('div')
        globalDiv.setAttribute('style', 'margin: 20px 20px 0 0;overflow: auto')
        globalDiv.setAttribute('id', 'modal-global-div')


        // Image div
        const imageDiv = document.createElement('img');
        imageDiv.setAttribute(
            'src',
            song_image,
        );
        imageDiv.setAttribute('width', "175")
        imageDiv.setAttribute('height', "175")
        imageDiv.setAttribute('style', 'float: left')
        imageDiv.setAttribute('id', 'modal-album-cover-img')

        // Content div
        const contentDiv = document.createElement('div')
        contentDiv.setAttribute('style', ' margin-left: 210px')

        // User total play count div
        const artistName = document.createElement('div');
        artistName.innerText = `${trackInfo.track.artist.name} | ${trackInfo?.track?.album?.title ?? ''}`
        artistName.setAttribute('id', 'modal-artist-name')

        // User total play count div
        const userPlayCount = document.createElement('div');
        userPlayCount.innerText = `Personal total scrobbles: ${trackInfo.track.userplaycount}`
        userPlayCount.setAttribute('id', 'modal-total-user-scrobbles')

        // Total artist play div
        const totalArtistPlayCount = document.createElement('div');
        totalArtistPlayCount.innerText = `Total song scrobbles: ${trackInfo.track.playcount}`
        totalArtistPlayCount.setAttribute('id', 'modal-total-artist-scrobbles')

        // Total listeners div
        const totalListenersCount = document.createElement('div');
        totalListenersCount.innerText = `Total song listeners: ${trackInfo.track.listeners}`
        totalListenersCount.setAttribute('id', 'modal-total-listeners')

        // Link to song div
        const linkToSong = document.createElement('a');
        linkToSong.innerText = `Link to song`
        linkToSong.setAttribute('id', 'modal-song-link')
        linkToSong.setAttribute('href', trackInfo.track.url)

        // Modal Creation
        globalDiv.appendChild(imageDiv)
        globalDiv.appendChild(contentDiv)
        contentDiv.appendChild(artistName)
        contentDiv.appendChild(userPlayCount)
        contentDiv.appendChild(totalListenersCount)
        contentDiv.appendChild(totalArtistPlayCount)

        // Tags div
        if (tagsList.length > 0) {
            const tagsDiv = document.createElement('div');
            tagsDiv.setAttribute('id', 'modal-tags')
            let tagList = tagsList.toString().split(",");
            let tags = "";

            for (let i=0; i< tagList.length; i++){
                tagList[i] = tagList[i].charAt(0).toUpperCase() + tagList[i].slice(1);
                tags += tagList[i] + " "
              }


            tagsDiv.innerText = `Tags: ${tags}`
            contentDiv.appendChild(tagsDiv)
        }
        contentDiv.appendChild(linkToSong)
        addSongContainer.append(globalDiv);

        const triggerModal = () => {
            Spicetify.PopupModal.display({
                title: modalTitle,
                content: addSongContainer,
                isLarge: true,
            });
        };

        if (addSongContainer) {
            triggerModal();
            return;
        }
    }

    async function updateTrackModal(currentSong, trackInfo) {
        const modalTitle = `Stats for ${currentSong.name}`;

        document.getElementById("modal-total-user-scrobbles").innerHTML = await trackInfo.track.userplaycount;
        document.getElementById("modal-total-artist-scrobbles").innerHTML = await trackInfo.track.playcount;
        document.getElementById("modal-total-listeners").innerHTML = await trackInfo.track.listeners;
        document.getElementById("modal-album-cover-img").innerHTML = await currentSong.image[2]['#text'];
        document.getElementById("modal-song-link").href = await trackInfo.track.url;
        document.getElementById("modal-artist-name").innerHTML = await `${trackInfo.track.artist.name} | ${trackInfo.track.album.title}`

        const triggerModal = () => {
            Spicetify.PopupModal.display({
                title: modalTitle,
                content: addSongContainer,
                isLarge: true,
            });
        };

        if (addSongContainer) {
            triggerModal();
            return;
        }
    }

    async function getSongStats(song_id) {
        await validateLocalStorage()
        let lastFmUsername = await getLocalStorageData(`lastFmUsername`)
        let currentSong = await fetchSong(song_id)
        let trackInfo = await fetchTrackInfo(currentSong.artist, currentSong.name, lastFmUsername.userName)

        if (document.getElementById("modal-global-div")) {
            await updateTrackModal(currentSong.image, currentSong.name, trackInfo)
        } else {
            await createTrackModal(currentSong.image, currentSong.name, trackInfo)
        }
    }

    const registerUsernameMenuItem = new Spicetify.Menu.Item(RegisteredUsername, false, async () => {
        await setLastFmUsername();
    });

    new Spicetify.Menu.SubMenu("Last.fm Stats", [registerUsernameMenuItem]).register();

    new Spicetify.ContextMenu.Item(
        "Last.FM Song Stats",
        (uris) => {
            let songUri = uris[0]
            let song_id = songUri.split(":")[2]

            getSongStats(song_id);
        },
        (uris) => {
            if (uris.length != 1) return false;
            return Spicetify.URI.fromString(uris[0]).type == Spicetify.URI.Type.TRACK;
        }
    ).register();
})();
