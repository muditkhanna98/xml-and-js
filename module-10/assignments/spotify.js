const clientId = `17a7004502024f43bb621b6410529d47`;
const clientSecret = `e3fc48adbef94ee28806ede6f91fe5a2`;

const getToken = async () => {
  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
    },
    body: "grant_type=client_credentials",
  });

  const data = await result.json();
  getGenres(data.access_token);
  return data.access_token;
};

const getGenres = async (token) => {
  const result = await fetch(
    `https://api.spotify.com/v1/browse/categories?locale=sv_US`,
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    }
  );

  const data = await result.json();
  return data.categories.items;
};

const getPlaylistByGenre = async (token, genreId) => {
  const limit = 10;

  const result = await fetch(
    `https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`,
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    }
  );

  const data = await result.json();
  return data.playlists.items;
};

const loadData = async () => {
  const token = await getToken();
  const genres = await getGenres(token);
  const list = document.getElementById(`genres`);

  genres.map(async ({ name, id, icons: [icon], href }) => {
    const playlists = await getPlaylistByGenre(token, id);
    playlists.map((value) => console.log(value));
    const playlistsList = playlists
      .map(
        ({
          name,
          external_urls: { spotify },
          images: [image],
          description,
          tracks,
        }) => `
        <li>
          <a href="${spotify}" alt="${name}" target="_blank">
            <img src="${image.url}" width="180" height="180"/>
          </a>
          <div>
          <h3>${name}</h3>
          <h2>${description}</h2>
          <h4>Total Tracks: ${tracks.total}</h4>
          </div>
        </li>`
      )
      .join(``);

    if (playlists) {
      const html = `
      <article>
      <div class="genre-block" onclick="openList(${name})">
        <img class="genre-image" src="${icon.url}" width="${icon.width}" height="${icon.height}" alt="${name}"/>
          <h2>${name}</h2>
        </div>
          <ol class="hide" id="${name}">
            ${playlistsList}
          </ol>
      </article>`;

      list.insertAdjacentHTML("beforeend", html);
    }
  });
};

loadData();

openList = (element) => {
  element.classList.toggle("hide");
};
