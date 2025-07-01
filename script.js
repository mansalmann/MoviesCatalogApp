const apiKey = "b47c62fc92cd61614e56ac74e9e59950";
const imgApi = "https://image.tmdb.org/t/p/w1280";
const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=`; // url yang digunakan ketika user mencari sebuah film berdasarkan query yang dikirim
const form = document.getElementById("search-form");
const query = document.getElementById("search-input");
const results = document.getElementById("results");
const header = document.querySelector("header");
const month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

let page = 1;
let isSearching = false;

// pengaturan navbar
window.addEventListener("scroll",function(){
    if(window.scrollY > header.offsetTop){
        header.classList.remove("navbar");
        header.classList.add("navbar-fixed");

    }else{
        header.classList.add("navbar");
        header.classList.remove("navbar-fixed");
    };
});

// fetch data dari url
async function fetchDataMovie(url){
    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error("Jaringan sedang bermasalah")
        }
        return response.json();
    } catch(error){
        return null;
    }
}

// fetch data dan tampilkan hasil berdasarkan url
async function fetchShowResults(url){
    if(page == 1){
        results.innerHTML = "<p>Tunggu sebentar, sedang memuat data film...<p>";
    }
    const dataMovie = await fetchDataMovie(url); // dataMovie adalah sebuah object yang berisi informasi mengenai film yang ditemukan
    if(dataMovie.results && page == 1){
        results.innerHTML = "";    
        showResults(dataMovie.results); // data yang dibutuhkan berupa array (20) mengenai detail / informasi film
    }else if(dataMovie.results){
        showResults(dataMovie.results); // data yang dibutuhkan berupa array (20) mengenai detail / informasi film
    }
}

// fetch link imdb berdasarkan judul film
async function fetchMovieData(original_title) {
    const imdb = `https://www.omdbapi.com/?apikey=a131b8fb&t=${original_title}`; 
    const response = await fetch(imdb);
    
    return response.json();
  }

// buat kartu grafis informasi film
async function createMovieCard(movie){
    // object destructuring
    const {poster_path, original_title, release_date, overview, vote_average} = movie;
    // dapatkan link ke poster filmnya
    const imagePath =   poster_path ? imgApi + poster_path : "/img-01.jpeg";
    // dapatkan data judulnya
    const truncatedTitle =  original_title.length > 15 ? original_title.slice(0, 15) + "..." : original_title;
    
    // dapatkan id imdb dari filmnya
    const movieData =  await fetchMovieData(original_title)
    
    // dapatkan data tanggal rilisnya
    const MovieDate = new Date(release_date);
    const date = MovieDate.getDate() + " " + month[MovieDate.getMonth()] + " " + MovieDate.getFullYear();
    const formattedDate =  date || "Tanggal rilis tidak ada";

    // dapatkan data rating film berdasarkan tmdb
    const ratingFilm = vote_average.toFixed(1);

    // membuat template card movie dari data2 film di atas
    const cardTemplate =   `
        <div class="column">
            <div class="card">
                <span class="card-media">
                    <img src="${imagePath}" alt="${original_title}" width="100%">
                </span>
        
                <div class="card-content">
                <span>TMDB Score: <i class="fa-solid fa-star"></i> ${ratingFilm}</span>
                    <div class="card-header">
                        <div class="left-content">
                            <h3 style="font-weight:600">${truncatedTitle}</h3>
                            <span style="color: #12efec">${formattedDate}</span>
                        </div>
                        <div class="right-content">
                            <a href="https://www.imdb.com/title/${movieData.imdbID}" target="_blank" class="card-btn">See IMDB</a>
                        </div>
                    </div>

                    <div class="info">
                    ${overview || "No tidak ada informasi"}
                    </div>
                </div>
            </div>
        </div>
    `;
    return cardTemplate;
}

// hapus hasil pencarian
function clearResults(){
    results.innerHTML = "";
}

// tampilkan hasil pencarian di halaman web
async function showResults(dataMovie){
    const result = dataMovie.map(async (movie) => {
        const cardTemplate = await createMovieCard(movie);
        return cardTemplate;
      });
      const newContent = await Promise.all(result); // tunggu semua hasil promises 
      // movie baru nanti diproses
      results.innerHTML += newContent.join("") || "<p>Tidak ada hasil yang ditemukan.</p>"; // menambahkan daftar film ke halaman 
}

// memuat lagi hasil 
async function loadMoreResults(){
        page++;
        const searchTerm = query.value;
        const urlResult = searchTerm ? `${url}${searchTerm}&page=${page}` : `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`;
        await fetchShowResults(urlResult);
};

// mendeteksi halaman terakhir dan muat hasil lebih banyak lagi
function detectEnd(){
    const {scrollTop, clientHeight, scrollHeight} = document.documentElement; // object html document
    if(scrollTop + clientHeight >= scrollHeight - 20){
        loadMoreResults();
    }
}

// Pencarian film
async function handleSearch(e){
    e.preventDefault(); // cegah event default dari element form
    const searchTerm = query.value.trim();
    if(searchTerm){
        isSearching = true;
        clearResults();
        const newUrl = `${url}${searchTerm}&page=${page}`;
        await fetchShowResults(newUrl);
        // query.value =  "";
    }
}

// event listeners
form.addEventListener("submit", handleSearch);
window.addEventListener("scroll", detectEnd);
window.addEventListener("resize", detectEnd);


// inisialisasi program
async function init(){
    clearResults(); // hapus dulu isi dari halaman
    const urlResult = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`; // menampilkan movie berdasarkan popularitas
    isSearching = false; // kondisi akses dari user apakah sedang mencari film atau tidak
    await fetchShowResults(urlResult);
};

init(); // awal dari program