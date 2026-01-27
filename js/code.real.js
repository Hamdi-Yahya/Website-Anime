const API_BASE_URL = 'https://www.sankavollerei.com/anime' ;
const ENDPOINTS = {
    ONGOING: '/ongoing-anime',
    COMPLETED: '/complete-anime',
    ANIME_DETAIL: '/anime',
    EPISODE: '/episode',
    GENRE_LIST: '/genre',
    GENRE_ANIME: '/genre',
    SERVER: '/server',
    SEARCH: '/search'
}

const state = {
    ongoingPage: 1,
    completedPage: 1,
    ongoingData: [], 
    completedData: [],
    currentAnime: null,
    currentEpisode: null, 

    genreList: [],
    currentGenre: null,
    genrePage: 1,
    genreAnimeData: [],

    searchKeyword: '',
    searchResult: []
}

function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);

    return urlParams.get(param);
}

function buildUrl(base, params = {}) {
    const url = new URL(base);

    Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
            url.searchParams.append(key, params[key]);
        }
    });

    return url.toString();
}

function formatDate(dateString) {
    if (!dateString) return "-";

    try {
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
        };

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString("id-ID", options);
    } catch (error) {
        return dateString;
    }
}

function slugify(text) {
    return text

        .toString()

        .toLowerCase()

        .trim()

        .replace(/\s+/g, "-")

        .replace(/[^\w\-]+/g, "")

        .replace(/\-\-+/g, "-");
}

function setLoadingState(container, isLoading) {
    if (isLoading) {
        container.innerHTML = generateSkeletonCards(6);
    }
}

function generateSkeletonCards(count) {
    let html = "";

    for (let i = 0; i < count; i++) {
        html += `
            <!-- Skeleton Card ${i + 1} -->
            <div class="col-6 col-md-4 col-lg-3 col-xl-2">
                <!-- Class 'skeleton' di CSS akan menambahkan animasi pulse -->
                <div class="anime-card skeleton">
                    <!-- Skeleton placeholder untuk gambar poster -->
                    <div class="skeleton-img"></div>
                    <!-- Skeleton placeholder untuk judul -->
                    <div class="skeleton-text"></div>
                    <!-- Skeleton placeholder untuk info (lebih pendek) -->
                    <div class="skeleton-text short"></div>
                </div>
            </div>
        `;
    }

    return html;
}

function showError(container, message) {
    container.innerHTML = `
        <!-- Alert Error menggunakan Bootstrap -->
        <div class="col-12">
            <div class="alert alert-danger d-flex align-items-center" role="alert">
                <!-- Icon warning dari Bootstrap Icons -->
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <!-- Pesan error yang diterima dari parameter -->
                <div>${message}</div>
            </div>
        </div>
    `;
}

async function fetchFromAPI(endpoint, params = {}) {
    const url = buildUrl(API_BASE_URL + endpoint, params);

    console.log("Fetching:", url);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        console.log("Data received:", data);

        return data;
    } catch (error) {
        console.error("API Fetch Error:", error);

        throw error;
    }
}

async function fetchOngoingAnime(page = 1) {
    return await fetchFromAPI(ENDPOINTS.ONGOING, { page });
}

async function fetchCompletedAnime(page = 1) {
    return await fetchFromAPI(ENDPOINTS.COMPLETED, { page });
}

async function fetchAnimeDetail(slug) {
    return await fetchFromAPI(`${ENDPOINTS.ANIME_DETAIL}/${slug}`);
}

async function fetchEpisodeDetail(slug) {
    return await fetchFromAPI(`${ENDPOINTS.EPISODE}/${slug}`);
}

async function fetchServerUrl(serverId) {
    return await fetchFromAPI(`${ENDPOINTS.SERVER}/${serverId}`);
}

async function fetchGenreList() {
    return await fetchFromAPI(ENDPOINTS.GENRE_LIST);
}

async function fetchAnimeByGenre(genreSlug, page = 1) {
    return await fetchFromAPI(`${ENDPOINTS.GENRE_ANIME}/${genreSlug}`, { page });
}

async function searchAnime(keyword) {
    const encodedKeyword = encodeURIComponent(keyword);
    return await fetchFromAPI(`${ENDPOINTS.SEARCH}/${encodedKeyword}`);
}

function renderAnimeCard(anime, type = "ongoing") {
    const {
        title = "Unknown Title",
        poster = "https://via.placeholder.com/300x400?text=No+Image",
        episodes = 0,
        score = "N/A",
        animeId = "",
        releaseDay = "",
        latestReleaseDate = "",
        lastReleaseDate = "",
    } = anime;

    const badgeText = type === "ongoing" ? releaseDay : "Tamat";
    const dateInfo = type === "ongoing" ? latestReleaseDate : lastReleaseDate;

    return `
        <!-- Card Anime: ${title} -->
        <!--
            Bootstrap Grid Classes:
            - col-6: 6 dari 12 kolom (50% width) di layar kecil
            - col-md-4: 4 dari 12 kolom (33% width) di layar medium
            - col-lg-3: 3 dari 12 kolom (25% width) di layar besar
            - col-xl-2: 2 dari 12 kolom (16.6% width) di layar ekstra besar

            Ini membuat layout responsif - card akan menyesuaikan ukuran layar
        -->
        <div class="col-6 col-md-4 col-lg-3 col-xl-2">
            <!--
                Link ke halaman detail
                href: mengarah ke detail.html dengan parameter id

                Query string ?id=${animeId} akan digunakan di detail.html
                untuk mengambil data anime yang spesifik
            -->
            <a href="detail.html?id=${animeId}" class="anime-card d-block">
                <!--
                    Badge hari rilis atau status

                    Ini adalah contoh CONDITIONAL RENDERING:
                    ${badgeText ? `HTML` : ""}

                    Artinya: Jika badgeText ada, tampilkan HTML badge
                             Jika tidak ada, tampilkan string kosong
                -->
                ${badgeText ? `<span class="card-badge">${badgeText}</span>` : ""}

                <!-- Badge score di pojok kanan -->
                <span class="score-badge">
                    <i class="bi bi-star-fill"></i>
                    ${score || "N/A"}
                    <!--
                        ${score || "N/A"} menggunakan operator ||
                        Jika score falsy (null, undefined, ''), gunakan 'N/A'
                    -->
                </span>

                <!-- Gambar poster anime -->
                <img
                    src="${poster}"
                    alt="${title}"
                    class="card-img"
                    loading="lazy"
                    onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'"
                >
                <!--
                    Atribut penting:
                    - src: URL gambar poster
                    - alt: Teks alternatif untuk aksesibilitas
                    - loading="lazy": Browser akan load gambar saat mendekati viewport (hemat bandwidth)
                    - onerror: Jika gambar gagal load, ganti dengan placeholder
                -->

                <!-- Overlay saat hover (muncul dari bawah) -->
                <div class="card-overlay">
                    <span class="btn btn-pink btn-sm w-100">
                        <i class="bi bi-play-fill me-1"></i>Tonton
                    </span>
                </div>

                <!-- Body card dengan info anime -->
                <div class="card-body">
                    <!-- Judul anime (CSS akan membatasi 2 baris dengan ellipsis) -->
                    <h6 class="card-title">${title}</h6>

                    <!-- Info episode dan tanggal -->
                    <div class="card-info">
                        <span>
                            <i class="bi bi-collection-play me-1"></i>
                            ${episodes} Eps
                        </span>
                        <span>${dateInfo || ""}</span>
                    </div>
                </div>
            </a>
        </div>
    `;
}

function renderAnimeCards(animeList, container, type = "ongoing") {
    if (!animeList || animeList.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <!-- Icon inbox besar -->
                <i class="bi bi-inbox display-1 text-muted"></i>
                <!-- Pesan tidak ada anime -->
                <p class="text-muted mt-3">Tidak ada anime ditemukan</p>
            </div>
        `;

        return;
    }

    const cardsArray = animeList.map((anime) => renderAnimeCard(anime, type));

    const cardsHTML = cardsArray.join("");

    container.innerHTML = cardsHTML;

    container.querySelectorAll(".col-6").forEach((col, index) => {
        col.style.animationDelay = `${index * 0.05}s`;

        col.classList.add("fade-in-up");
    });
}

function renderGenreBadges(genreList) {
    if (!genreList || genreList.length === 0) {
        return '<span class="text-muted">Tidak ada genre</span>';
    }

    return genreList
        .map(
            (genre) => `
        <span class="badge">${genre.title}</span>
    `,
        )
        .join("");
}

function renderEpisodeGrid(episodeList) {
    if (!episodeList || episodeList.length === 0) {
        return '<p class="text-muted">Belum ada episode tersedia</p>';
    }

    return episodeList
        .map(
            (episode) => `
        <!-- Episode ${episode.eps} -->
        <a href="watch.html?id=${episode.episodeId}" class="episode-item">
            <span class="eps-num">Ep ${episode.eps}</span>
            <span class="eps-date">${episode.date || ""}</span>
        </a>
    `,
        )
        .join("");
}

function renderRecommendationGrid(recommendList) {
    if (!recommendList || recommendList.length === 0) {
        return '<p class="text-muted text-center">Tidak ada rekomendasi</p>';
    }

    const limited = recommendList.slice(0, 6);

    return limited
        .map(
            (anime) => `
        <!-- Rekomendasi: ${anime.title} -->
        <a href="detail.html?id=${anime.animeId}" class="recommendation-item">
            <img
                src="${anime.poster}"
                alt="${anime.title}"
                loading="lazy"
                onerror="this.src='https://via.placeholder.com/150x200?text=No+Image'"
            >
            <div class="title">${anime.title}</div>
        </a>
    `,
        )
        .join("");
}

function renderQualityTabs(serverData) {
    if (
        !serverData ||
        !serverData.qualities ||
        serverData.qualities.length === 0
    ) {
        return {
            tabs: '<p class="text-muted">Tidak ada server tersedia</p>',
            content: "",
        };
    }

    const qualities = serverData.qualities;
    let tabsHTML = "";
    let contentHTML = "";

    qualities.forEach((quality, index) => {
        const tabId = `quality-${quality.title.replace(/\s/g, "")}`;

        const isActive = index === 0;

        tabsHTML += `
            <li class="nav-item" role="presentation">
                <button
                    class="nav-link ${isActive ? "active" : ""}"
                    id="${tabId}-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#${tabId}"
                    type="button"
                    role="tab"
                >
                    ${quality.title}
                </button>
            </li>
        `;

        let serversHTML = "";
        if (quality.serverList && quality.serverList.length > 0) {
            serversHTML = quality.serverList
                .map(
                    (server, serverIndex) => `
                <button
                    class="server-btn ${isActive && serverIndex === 0 ? "active" : ""}"
                    data-server-id="${server.serverId}"
                    data-server-href="${server.href}"
                >
                    ${server.title}
                </button>
            `,
                )
                .join("");
        } else {
            serversHTML =
                '<p class="text-muted mb-0">Tidak ada server untuk kualitas ini</p>';
        }

        contentHTML += `
            <div
                class="tab-pane fade ${isActive ? "show active" : ""}"
                id="${tabId}"
                role="tabpanel"
            >
                <div class="server-grid">
                    ${serversHTML}
                </div>
            </div>
        `;
    });

    return { tabs: tabsHTML, content: contentHTML };
}

function renderDownloadAccordion(downloadData) {
    if (
        !downloadData ||
        !downloadData.qualities ||
        downloadData.qualities.length === 0
    ) {
        return '<p class="text-muted">Tidak ada link download tersedia</p>';
    }

    const qualities = downloadData.qualities;

    return qualities
        .map((quality, index) => {
            let linksHTML = "";
            if (quality.urls && quality.urls.length > 0) {
                linksHTML = quality.urls
                    .map(
                        (link) => `
                <a href="${link.url}" target="_blank" class="download-link">
                    <i class="bi bi-download me-1"></i>${link.title}
                </a>
            `,
                    )
                    .join("");
            } else {
                linksHTML = '<span class="text-muted">Tidak ada link</span>';
            }

            return `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button
                        class="accordion-button ${index !== 0 ? "collapsed" : ""}"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#download-${index}"
                    >
                        ${quality.title} ${quality.size ? `(${quality.size})` : ""}
                    </button>
                </h2>
                <div
                    id="download-${index}"
                    class="accordion-collapse collapse ${index === 0 ? "show" : ""}"
                >
                    <div class="accordion-body">
                        <div class="download-links">
                            ${linksHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
        })
        .join("");
}

function renderEpisodeScrollList(episodeList, currentEpisodeId) {
    if (!episodeList || episodeList.length === 0) {
        return '<p class="text-muted text-center">Tidak ada episode</p>';
    }

    return episodeList
        .map((episode) => {
            const isActive = episode.episodeId === currentEpisodeId;

            return `
            <a
                href="watch.html?id=${episode.episodeId}"
                class="episode-list-item ${isActive ? "active" : ""}"
            >
                <span class="eps-num">${episode.eps}</span>
                <span class="eps-title">${episode.title}</span>
            </a>
        `;
        })
        .join("");
}

async function initHomepage() {
    console.log("Initializing Homepage...");

    const ongoingContainer = document.getElementById("ongoingAnimeContainer");
    const completedContainer = document.getElementById("completedAnimeContainer");

    const ongoingPrev = document.getElementById("ongoingPrev");
    const ongoingNext = document.getElementById("ongoingNext");
    const completedPrev = document.getElementById("completedPrev");
    const completedNext = document.getElementById("completedNext");

    const ongoingPageInfo = document.getElementById("ongoingPageInfo");
    const completedPageInfo = document.getElementById("completedPageInfo");

    async function loadOngoingAnime() {
        try {
            setLoadingState(ongoingContainer, true);

            const response = await fetchOngoingAnime(state.ongoingPage);

            state.ongoingData = response.data?.animeList || response.data || [];

            renderAnimeCards(state.ongoingData, ongoingContainer, "ongoing");

            if (ongoingPageInfo) {
                ongoingPageInfo.textContent = `Halaman ${state.ongoingPage}`;
            }

            if (ongoingPrev) {
                ongoingPrev.disabled = state.ongoingPage <= 1;
            }

            if (state.ongoingData.length > 0) {
                updateHeroSection(state.ongoingData[0]);
            }
        } catch (error) {
            console.error("Error loading ongoing anime:", error);
            showError(
                ongoingContainer,
                "Gagal memuat anime ongoing. Silakan refresh halaman.",
            );
        }
    }

    async function loadCompletedAnime() {
        try {
            setLoadingState(completedContainer, true);

            const response = await fetchCompletedAnime(state.completedPage);

            state.completedData = response.data?.animeList || response.data || [];

            renderAnimeCards(state.completedData, completedContainer, "completed");

            if (completedPageInfo) {
                completedPageInfo.textContent = `Halaman ${state.completedPage}`;
            }

            if (completedPrev) {
                completedPrev.disabled = state.completedPage <= 1;
            }
        } catch (error) {
            console.error("Error loading completed anime:", error);
            showError(
                completedContainer,
                "Gagal memuat anime completed. Silakan refresh halaman.",
            );
        }
    }

    function updateHeroSection(anime) {
        const heroTitle = document.getElementById("heroTitle");
        const heroDescription = document.getElementById("heroDescription");
        const heroScore = document.getElementById("heroScore");
        const heroEpisodes = document.getElementById("heroEpisodes");
        const heroWatchBtn = document.getElementById("heroWatchBtn");
        const heroInfoBtn = document.getElementById("heroInfoBtn");
        const heroSection = document.getElementById("heroSection");

        if (heroTitle) heroTitle.textContent = anime.title || "NezuPlay";
        if (heroDescription) {
            heroDescription.textContent = `Tonton ${anime.title} subtitle Indonesia. ${anime.episodes || 0} episode tersedia.`;
        }
        if (heroScore) heroScore.textContent = anime.score || "N/A";
        if (heroEpisodes) heroEpisodes.textContent = anime.episodes || "0";

        if (heroWatchBtn) {
            heroWatchBtn.href = `detail.html?id=${anime.animeId}`;
        }
        if (heroInfoBtn) {
            heroInfoBtn.href = `detail.html?id=${anime.animeId}`;
        }

        if (heroSection && anime.poster) {
            heroSection.style.backgroundImage = `url(${anime.poster})`;
        }
    }

    if (ongoingPrev) {
        ongoingPrev.addEventListener("click", () => {
            if (state.ongoingPage > 1) {
                state.ongoingPage--;
                loadOngoingAnime();
            }
        });
    }

    if (ongoingNext) {
        ongoingNext.addEventListener("click", () => {
            state.ongoingPage++;
            loadOngoingAnime();
        });
    }

    if (completedPrev) {
        completedPrev.addEventListener("click", () => {
            if (state.completedPage > 1) {
                state.completedPage--;
                loadCompletedAnime();
            }
        });
    }

    if (completedNext) {
        completedNext.addEventListener("click", () => {
            state.completedPage++;
            loadCompletedAnime();
        });
    }

    await Promise.all([loadOngoingAnime(), loadCompletedAnime()]);
}

async function initDetailPage() {
    console.log("Initializing Detail Page...");

    const slug = getUrlParam("id");

    if (!slug) {
        console.error("No anime ID provided");
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetchAnimeDetail(slug);

        if (!response.ok || !response.data) {
            throw new Error("Failed to fetch anime detail");
        }

        const anime = response.data;
        state.currentAnime = anime;

        document.title = `${anime.title} - NezuPlay`;

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = `Nonton ${anime.title} subtitle Indonesia di NezuPlay`;
        }

        updateDetailHeader(anime);
        updateSynopsis(anime);
        updateEpisodeList(anime);
        updateInfoSidebar(anime);
        updateRecommendations(anime);
    } catch (error) {
        console.error("Error loading anime detail:", error);

        document.querySelector(".detail-content").innerHTML = `
            <div class="container">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Gagal memuat detail anime. <a href="index.html">Kembali ke beranda</a>
                </div>
            </div>
        `;
    }
}

function updateDetailHeader(anime) {
    const detailBg = document.getElementById("detailBg");
    if (detailBg && anime.poster) {
        detailBg.style.backgroundImage = `url(${anime.poster})`;
    }

    const animePoster = document.getElementById("animePoster");
    if (animePoster) {
        animePoster.src = anime.poster || "https://via.placeholder.com/300x400";
        animePoster.alt = anime.title;
    }

    const animeScore = document.getElementById("animeScore");
    if (animeScore) animeScore.textContent = anime.score || "N/A";

    const animeTitle = document.getElementById("animeTitle");
    if (animeTitle) animeTitle.textContent = anime.title;

    const animeJapanese = document.getElementById("animeJapanese");
    if (animeJapanese) animeJapanese.textContent = anime.japanese || "";

    const animeStatus = document.getElementById("animeStatus");
    if (animeStatus) animeStatus.textContent = anime.status || "Unknown";

    const animeType = document.getElementById("animeType");
    if (animeType) animeType.textContent = anime.type || "TV";

    const animeEpisodes = document.getElementById("animeEpisodes");
    if (animeEpisodes) animeEpisodes.textContent = anime.episodes || "?";

    const animeDuration = document.getElementById("animeDuration");
    if (animeDuration) animeDuration.textContent = anime.duration || "Unknown";

    const animeAired = document.getElementById("animeAired");
    if (animeAired) animeAired.textContent = anime.aired || "Unknown";

    const breadcrumbTitle = document.getElementById("breadcrumbTitle");
    if (breadcrumbTitle) breadcrumbTitle.textContent = anime.title;

    const genreList = document.getElementById("genreList");
    if (genreList && anime.genreList) {
        genreList.innerHTML = renderGenreBadges(anime.genreList);
    }

    const watchFirstEpisode = document.getElementById("watchFirstEpisode");
    if (watchFirstEpisode && anime.episodeList && anime.episodeList.length > 0) {
        const firstEpisode = anime.episodeList[anime.episodeList.length - 1];
        watchFirstEpisode.href = `watch.html?id=${firstEpisode.episodeId}`;
    }

    const downloadBatch = document.getElementById("downloadBatch");
    if (downloadBatch && anime.batch) {
        downloadBatch.classList.remove("d-none");
        downloadBatch.href = anime.batch.otakudesuUrl || "#";
        downloadBatch.target = "_blank";
    }
}

function updateSynopsis(anime) {
    const animeSynopsis = document.getElementById("animeSynopsis");

    if (animeSynopsis) {
        if (
            anime.synopsis &&
            anime.synopsis.paragraphs &&
            anime.synopsis.paragraphs.length > 0
        ) {
            animeSynopsis.innerHTML = anime.synopsis.paragraphs
                .map((p) => `<p>${p}</p>`)
                .join("");
        } else {
            animeSynopsis.innerHTML =
                '<p class="text-muted">Sinopsis belum tersedia.</p>';
        }
    }

    const animeConnections = document.getElementById("animeConnections");
    const connectionList = document.getElementById("connectionList");

    if (
        animeConnections &&
        connectionList &&
        anime.synopsis &&
        anime.synopsis.connections &&
        anime.synopsis.connections.length > 0
    ) {
        animeConnections.classList.remove("d-none");

        connectionList.innerHTML = anime.synopsis.connections
            .map(
                (conn) => `
            <a href="detail.html?id=${conn.animeId}" class="badge bg-secondary me-2 mb-2">
                ${conn.title}
            </a>
        `,
            )
            .join("");
    }
}

function updateEpisodeList(anime) {
    const episodeList = document.getElementById("episodeList");

    if (episodeList && anime.episodeList) {
        episodeList.innerHTML = renderEpisodeGrid(anime.episodeList);
    }
}

function updateInfoSidebar(anime) {
    const animeStudio = document.getElementById("animeStudio");
    if (animeStudio) animeStudio.textContent = anime.studios || "-";

    const animeProducers = document.getElementById("animeProducers");
    if (animeProducers) animeProducers.textContent = anime.producers || "-";

    const animeTypeInfo = document.getElementById("animeTypeInfo");
    if (animeTypeInfo) animeTypeInfo.textContent = anime.type || "-";

    const animeStatusInfo = document.getElementById("animeStatusInfo");
    if (animeStatusInfo) animeStatusInfo.textContent = anime.status || "-";

    const animeEpisodeCount = document.getElementById("animeEpisodeCount");
    if (animeEpisodeCount) animeEpisodeCount.textContent = anime.episodes || "-";

    const animeDurationInfo = document.getElementById("animeDurationInfo");
    if (animeDurationInfo) animeDurationInfo.textContent = anime.duration || "-";

    const animeAiredInfo = document.getElementById("animeAiredInfo");
    if (animeAiredInfo) animeAiredInfo.textContent = anime.aired || "-";

    const animeScoreInfo = document.getElementById("animeScoreInfo");
    if (animeScoreInfo)
        animeScoreInfo.innerHTML = `<i class="bi bi-star-fill me-1"></i>${anime.score || "-"}`;
}

function updateRecommendations(anime) {
    const recommendationList = document.getElementById("recommendationList");

    if (recommendationList && anime.recommendedAnimeList) {
        recommendationList.innerHTML = renderRecommendationGrid(
            anime.recommendedAnimeList,
        );
    }
}

async function initWatchPage() {
    console.log("Initializing Watch Page...");

    const episodeSlug = getUrlParam("id");

    if (!episodeSlug) {
        console.error("No episode ID provided");
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetchEpisodeDetail(episodeSlug);

        if (!response.ok || !response.data) {
            throw new Error("Failed to fetch episode detail");
        }

        const episode = response.data;
        state.currentEpisode = episode;

        document.title = `${episode.title} - NezuPlay`;

        updateVideoPlayer(episode);
        updateEpisodeInfo(episode);
        updateEpisodeNavigation(episode);
        updateServerTabs(episode);
        updateDownloadLinks(episode);
        updateEpisodeSidebar(episode);
    } catch (error) {
        console.error("Error loading episode:", error);
        document.querySelector(".watch-main").innerHTML = `
            <div class="container" style="padding-top: 120px;">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Gagal memuat episode. <a href="index.html">Kembali ke beranda</a>
                </div>
            </div>
        `;
    }
}

async function updateVideoPlayer(episode) {
    const videoPlayer = document.getElementById("videoPlayer");
    const videoLoading = document.getElementById("videoLoading");

    if (videoLoading) videoLoading.classList.remove("hidden");

    try {
        let defaultServerId = null;

        if (episode.server) {
            if (episode.server.qualities && episode.server.qualities.length > 0) {
                const sortedQualities = ["720p", "480p", "360p"];

                for (const quality of sortedQualities) {
                    const qualityData = episode.server.qualities.find(
                        (q) =>
                            q.quality &&
                            q.quality.toLowerCase().includes(quality.replace("p", "")),
                    );

                    if (
                        qualityData &&
                        qualityData.serverList &&
                        qualityData.serverList.length > 0
                    ) {
                        defaultServerId = qualityData.serverList[0].serverId;
                        break;
                    }
                }
            }
        }

        if (defaultServerId) {
            console.log("Fetching server URL for:", defaultServerId);

            const serverData = await fetchServerUrl(defaultServerId);

            if (serverData.ok && serverData.data && serverData.data.url) {
                if (videoPlayer) {
                    videoPlayer.src = serverData.data.url;
                    console.log("Video URL set to:", serverData.data.url);
                }
            } else {
                throw new Error("Invalid server response");
            }
        } else if (episode.defaultStreamingUrl) {
            if (videoPlayer) {
                videoPlayer.src = episode.defaultStreamingUrl;
            }
        }

        if (videoPlayer) {
            videoPlayer.addEventListener("load", () => {
                if (videoLoading) {
                    videoLoading.classList.add("hidden");
                }
            });
        }
    } catch (error) {
        console.error("Error loading video:", error);

        if (videoPlayer && episode.defaultStreamingUrl) {
            videoPlayer.src = episode.defaultStreamingUrl;
        }

        if (videoLoading) {
            videoLoading.classList.add("hidden");
        }
    }
}

function updateEpisodeInfo(episode) {
    const episodeTitle = document.getElementById("episodeTitle");
    if (episodeTitle) episodeTitle.textContent = episode.title;

    const episodeReleaseTime = document.getElementById("episodeReleaseTime");
    if (episodeReleaseTime) {
        episodeReleaseTime.innerHTML = `<i class="bi bi-clock me-1"></i>${episode.releaseTime || ""}`;
    }

    const episodeMeta = document.getElementById("episodeMeta");
    if (episodeMeta && episode.info) {
        let metaHTML = "";

        if (episode.info.type) {
            metaHTML += `<span class="badge bg-secondary me-2"><i class="bi bi-tv me-1"></i>${episode.info.type}</span>`;
        }
        if (episode.info.duration) {
            metaHTML += `<span class="badge bg-secondary me-2"><i class="bi bi-clock me-1"></i>${episode.info.duration}</span>`;
        }

        episodeMeta.innerHTML = metaHTML;
    }

    const breadcrumbAnime = document.getElementById("breadcrumbAnime");
    if (breadcrumbAnime && episode.animeId) {
        breadcrumbAnime.href = `detail.html?id=${episode.animeId}`;

        breadcrumbAnime.textContent = episode.title.split(" Episode")[0] || "Anime";
    }

    const breadcrumbEpisode = document.getElementById("breadcrumbEpisode");
    if (breadcrumbEpisode) {
        const epsMatch = episode.title.match(/Episode (\d+)/i);
        breadcrumbEpisode.textContent = epsMatch
            ? `Episode ${epsMatch[1]}`
            : "Episode";
    }
}

function updateEpisodeNavigation(episode) {
    const prevEpisode = document.getElementById("prevEpisode");
    if (prevEpisode) {
        if (episode.hasPrevEpisode && episode.prevEpisode) {
            prevEpisode.classList.remove("d-none");
            prevEpisode.href = `watch.html?id=${episode.prevEpisode.episodeId}`;
        } else {
            prevEpisode.classList.add("d-none");
        }
    }

    const nextEpisode = document.getElementById("nextEpisode");
    if (nextEpisode) {
        if (episode.hasNextEpisode && episode.nextEpisode) {
            nextEpisode.classList.remove("d-none");
            nextEpisode.href = `watch.html?id=${episode.nextEpisode.episodeId}`;
        } else {
            nextEpisode.classList.add("d-none");
        }
    }
}

function updateServerTabs(episode) {
    const qualityTabs = document.getElementById("qualityTabs");
    const qualityTabContent = document.getElementById("qualityTabContent");

    if (qualityTabs && qualityTabContent && episode.server) {
        const { tabs, content } = renderQualityTabs(episode.server);
        qualityTabs.innerHTML = tabs;
        qualityTabContent.innerHTML = content;

        document.querySelectorAll(".server-btn").forEach((btn) => {
            btn.addEventListener("click", async function () {
                this.closest(".server-grid")
                    .querySelectorAll(".server-btn")
                    .forEach((b) => {
                        b.classList.remove("active");
                    });

                this.classList.add("active");

                const serverId = this.dataset.serverId;

                if (serverId) {
                    try {
                        const videoLoading = document.getElementById("videoLoading");
                        if (videoLoading) videoLoading.classList.remove("hidden");

                        const serverData = await fetchServerUrl(serverId);

                        if (serverData.ok && serverData.data && serverData.data.url) {
                            const videoPlayer = document.getElementById("videoPlayer");
                            if (videoPlayer) {
                                videoPlayer.src = serverData.data.url;
                            }
                        }
                    } catch (error) {
                        console.error("Error fetching server URL:", error);

                        alert("Gagal memuat server. Silakan coba server lain.");
                    }
                }
            });
        });
    }
}

function updateDownloadLinks(episode) {
    const downloadAccordion = document.getElementById("downloadAccordion");

    if (downloadAccordion && episode.downloadUrl) {
        downloadAccordion.innerHTML = renderDownloadAccordion(episode.downloadUrl);
    }
}

function updateEpisodeSidebar(episode) {
    const episodeInfoMini = document.getElementById("episodeInfoMini");
    if (episodeInfoMini && episode.info) {
        episodeInfoMini.innerHTML = `
            <small class="text-muted d-block">
                <i class="bi bi-person me-1"></i>Credit: ${episode.info.credit || "-"}
            </small>
            <small class="text-muted d-block">
                <i class="bi bi-gear me-1"></i>Encoder: ${episode.info.encoder || "-"}
            </small>
        `;
    }

    const episodeScrollList = document.getElementById("episodeScrollList");
    if (episodeScrollList && episode.info && episode.info.episodeList) {
        const currentEpisodeId = getUrlParam("id");

        episodeScrollList.innerHTML = renderEpisodeScrollList(
            episode.info.episodeList,
            currentEpisodeId,
        );
    }

    const linkToDetail = document.getElementById("linkToDetail");
    if (linkToDetail && episode.animeId) {
        linkToDetail.href = `detail.html?id=${episode.animeId}`;
    }
}

function initNavbarScroll() {
    const navbar = document.getElementById("mainNavbar");

    if (navbar) {
        const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

        const sections = {
            heroSection: "index.html",
            "ongoing-section": "#ongoing-section",
            "completed-section": "#completed-section",
        };

        function updateActiveNav() {
            if (window.scrollY > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }

            const path = window.location.pathname;

            const page = path.split("/").pop() || "index.html";

            if (page !== "index.html" && page !== "" && page !== "fase1-3") {
                return;
            }

            const scrollPosition = window.scrollY + 150;
            let currentSection = "heroSection";

            Object.keys(sections).forEach((sectionId) => {
                const section = document.getElementById(sectionId);

                if (section) {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;

                    if (
                        scrollPosition >= sectionTop &&
                        scrollPosition < sectionTop + sectionHeight
                    ) {
                        currentSection = sectionId;
                    }
                }
            });

            navLinks.forEach((link) => {
                if (!link.classList.contains("dropdown-toggle")) {
                    link.classList.remove("active");
                }

                const href = link.getAttribute("href");

                if (currentSection === "heroSection" && href === "index.html") {
                    link.classList.add("active");
                } else if (
                    currentSection === "ongoing-section" &&
                    href === "#ongoing-section"
                ) {
                    link.classList.add("active");
                } else if (
                    currentSection === "completed-section" &&
                    href === "#completed-section"
                ) {
                    link.classList.add("active");
                }
            });
        }

        window.addEventListener("scroll", updateActiveNav);

        navLinks.forEach((link) => {
            link.addEventListener("click", function () {
                const href = this.getAttribute("href");

                if (href && href.startsWith("#")) {
                    navLinks.forEach((nav) => {
                        if (!nav.classList.contains("dropdown-toggle")) {
                            nav.classList.remove("active");
                        }
                    });

                    this.classList.add("active");
                }
            });
        });

        updateActiveNav();
    }
}

function initBackToTop() {
    const backToTop = document.getElementById("backToTop");

    if (backToTop) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                backToTop.classList.add("show");
            } else {
                backToTop.classList.remove("show");
            }
        });

        backToTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        });
    }
}

function initSearchForm() {
    const searchForm = document.querySelector(".search-form");
    const searchInput = document.getElementById("searchInput");

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const query = searchInput.value.trim();

            if (query) {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        });
    }
}

async function initGenrePage() {
    console.log("Initializing Genre Page...");

    const genrePillsContainer = document.getElementById("genrePillsContainer");

    const genreAnimeContainer = document.getElementById("genreAnimeContainer");
    const genreAnimeHeader = document.getElementById("genreAnimeHeader");
    const genreDefaultMessage = document.getElementById("genreDefaultMessage");
    const genrePageInfoContainer = document.getElementById(
        "genrePageInfoContainer",
    );

    const genrePageTitle = document.getElementById("genrePageTitle");
    const genreDescription = document.getElementById("genreDescription");
    const selectedGenreTitle = document.getElementById("selectedGenreTitle");
    const genreAnimeInfo = document.getElementById("genreAnimeInfo");
    const genrePageInfo = document.getElementById("genrePageInfo");
    const breadcrumbGenre = document.getElementById("breadcrumbGenre");

    const genrePrev = document.getElementById("genrePrev");
    const genreNext = document.getElementById("genreNext");

    async function loadGenreList() {
        try {
            genrePillsContainer.innerHTML = `
                <div class="d-flex justify-content-center py-4">
                    <div class="spinner-border text-pink" role="status">
                        <span class="visually-hidden">Memuat genre...</span>
                    </div>
                </div>
            `;

            const response = await fetchGenreList();

            state.genreList = response.data?.genreList || [];

            renderGenrePills(state.genreList);
        } catch (error) {
            console.error("Error loading genre list:", error);
            genrePillsContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Gagal memuat daftar genre.
                </div>
            `;
        }
    }

    function renderGenrePills(genreList) {
        if (!genreList || genreList.length === 0) {
            genrePillsContainer.innerHTML =
                '<p class="text-muted">Tidak ada genre tersedia</p>';
            return;
        }

        const pillsHTML = genreList
            .map(
                (genre) => `
            <a
                href="?id=${genre.genreId}"
                class="genre-pill ${state.currentGenre === genre.genreId ? "active" : ""}"
                data-genre-id="${genre.genreId}"
                data-genre-title="${genre.title}"
            >
                ${genre.title}
            </a>
        `,
            )
            .join("");

        genrePillsContainer.innerHTML = `<div class="genre-pills-wrapper">${pillsHTML}</div>`;

        document.querySelectorAll(".genre-pill").forEach((pill) => {
            pill.addEventListener("click", (e) => {
                e.preventDefault();
                const genreId = pill.dataset.genreId;
                const genreTitle = pill.dataset.genreTitle;
                selectGenre(genreId, genreTitle);
            });
        });
    }

    async function selectGenre(genreId, genreTitle) {
        state.currentGenre = genreId;
        state.genrePage = 1;

        window.history.pushState({}, "", `?id=${genreId}`);

        document.title = `${genreTitle} - NezuPlay`;
        if (genrePageTitle) {
            genrePageTitle.innerHTML = `<i class="bi bi-tag-fill text-pink me-2"></i>${genreTitle}`;
        }
        if (genreDescription) {
            genreDescription.textContent = `Menampilkan anime genre ${genreTitle}`;
        }
        if (breadcrumbGenre) {
            breadcrumbGenre.textContent = genreTitle;
        }
        if (selectedGenreTitle) {
            selectedGenreTitle.innerHTML = `<i class="bi bi-collection-play-fill text-pink me-2"></i>Anime ${genreTitle}`;
        }

        document.querySelectorAll(".genre-pill").forEach((pill) => {
            pill.classList.toggle("active", pill.dataset.genreId === genreId);
        });

        await loadGenreAnime();
    }

    async function loadGenreAnime() {
        if (!state.currentGenre) return;

        try {
            if (genreDefaultMessage) genreDefaultMessage.classList.add("d-none");
            if (genreAnimeHeader) genreAnimeHeader.classList.remove("d-none");
            if (genrePageInfoContainer)
                genrePageInfoContainer.classList.remove("d-none");

            setLoadingState(genreAnimeContainer, true);

            const response = await fetchAnimeByGenre(
                state.currentGenre,
                state.genrePage,
            );

            state.genreAnimeData = response.data?.animeList || [];

            const pagination = response.pagination || {};
            if (genreAnimeInfo) {
                genreAnimeInfo.textContent = `Halaman ${state.genrePage} dari ${pagination.totalPages || 1}`;
            }
            if (genrePageInfo) {
                genrePageInfo.textContent = `Halaman ${state.genrePage}`;
            }

            if (genrePrev) {
                genrePrev.disabled = !pagination.hasPrevPage;
            }
            if (genreNext) {
                genreNext.disabled = !pagination.hasNextPage;
            }

            renderAnimeCards(state.genreAnimeData, genreAnimeContainer, "completed");
        } catch (error) {
            console.error("Error loading genre anime:", error);
            showError(genreAnimeContainer, "Gagal memuat anime. Silakan coba lagi.");
        }
    }

    if (genrePrev) {
        genrePrev.addEventListener("click", () => {
            if (state.genrePage > 1) {
                state.genrePage--;
                loadGenreAnime();
            }
        });
    }

    if (genreNext) {
        genreNext.addEventListener("click", () => {
            state.genrePage++;
            loadGenreAnime();
        });
    }

    await loadGenreList();

    const urlGenre = getUrlParam("id");
    if (urlGenre) {
        const genreData = state.genreList.find((g) => g.genreId === urlGenre);
        const genreTitle = genreData ? genreData.title : urlGenre;
        selectGenre(urlGenre, genreTitle);
    }
}

async function initSearchPage() {
    console.log("Initializing Search Page...");

    const mainSearchForm = document.getElementById("mainSearchForm");
    const mainSearchInput = document.getElementById("mainSearchInput");
    const searchResultContainer = document.getElementById(
        "searchResultContainer",
    );
    const searchResultHeader = document.getElementById("searchResultHeader");
    const searchDefaultMessage = document.getElementById("searchDefaultMessage");
    const searchKeywordSpan = document.getElementById("searchKeyword");
    const searchResultCount = document.getElementById("searchResultCount");
    const searchInfo = document.getElementById("searchInfo");
    const searchPageTitle = document.getElementById("searchPageTitle");

    async function performSearch(keyword) {
        if (!keyword || keyword.trim() === "") {
            return;
        }

        state.searchKeyword = keyword.trim();

        try {
            document.title = `Pencarian: ${state.searchKeyword} - NezuPlay`;
            if (searchPageTitle) {
                searchPageTitle.innerHTML = `<i class="bi bi-search text-pink me-2"></i>Hasil Pencarian`;
            }
            if (searchInfo) {
                searchInfo.textContent = `Mencari "${state.searchKeyword}"...`;
            }

            if (searchDefaultMessage) searchDefaultMessage.classList.add("d-none");
            if (searchResultHeader) searchResultHeader.classList.remove("d-none");

            if (searchKeywordSpan) {
                searchKeywordSpan.textContent = state.searchKeyword;
            }

            setLoadingState(searchResultContainer, true);

            const response = await searchAnime(state.searchKeyword);

            state.searchResults = response.data?.animeList || [];

            if (searchResultCount) {
                searchResultCount.textContent = `Ditemukan ${state.searchResults.length} anime`;
            }
            if (searchInfo) {
                searchInfo.textContent = `Menampilkan ${state.searchResults.length} hasil untuk "${state.searchKeyword}"`;
            }

            if (state.searchResults.length === 0) {
                searchResultContainer.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-emoji-frown display-1 text-muted mb-3"></i>
                        <h4 class="text-light">Tidak Ditemukan</h4>
                        <p class="text-muted">Tidak ada anime yang cocok dengan "${state.searchKeyword}"</p>
                    </div>
                `;
            } else {
                renderAnimeCards(
                    state.searchResults,
                    searchResultContainer,
                    "completed",
                );
            }
        } catch (error) {
            console.error("Error searching anime:", error);
            showError(
                searchResultContainer,
                "Gagal melakukan pencarian. Silakan coba lagi.",
            );
        }
    }

    if (mainSearchForm) {
        mainSearchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const query = mainSearchInput.value.trim();
            if (query) {
                window.history.pushState({}, "", `?q=${encodeURIComponent(query)}`);
                performSearch(query);
            }
        });
    }

    const urlQuery = getUrlParam("q");
    if (urlQuery) {
        if (mainSearchInput) {
            mainSearchInput.value = urlQuery;
        }
        await performSearch(urlQuery);
    }
}

function initApp() {
    console.log("Beannn App Initializing...");

    initNavbarScroll();
    initBackToTop();
    initSearchForm();

    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";

    console.log("Current page:", page);

    if (page === "index.html" || page === "" || page === "fase1-3") {
        initHomepage();
    } else if (page === "detail.html") {
        initDetailPage();
    } else if (page === "watch.html") {
        initWatchPage();
    } else if (page === "genre.html") {
        initGenrePage();
    } else if (page === "search.html") {
        initSearchPage();
    }
}

document.addEventListener("DOMContentLoaded", initApp);

window.addEventListener("error", (event) => {
    console.error("Global Error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled Promise Rejection:", event.reason);
});

// Prevent right click
document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    alert("⚠ SYSTEM FAILURE ⚠\nAn unexpected client-side exception has occurred. Please reload the page or try again.");
});

// Prevent certain keyboard shortcuts
document.addEventListener("keydown", function (e) {

    // Prevent F12 (DevTools)
    if (e.key === "F12") {
        e.preventDefault();
        alert("⚠ SYSTEM FAILURE ⚠\nAn unexpected client-side exception has occurred. Please reload the page or try again.");
    }

    // Prevent Ctrl + U (View Source)
    if (e.ctrlKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        alert("⚠ SYSTEM FAILURE ⚠\nAn unexpected client-side exception has occurred. Please reload the page or try again.");
    }

});