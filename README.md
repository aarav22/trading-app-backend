<a name="readme-top"></a>



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/aarav22/trading-app-backend">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Trading App</h3>

  <p align="center">
    A trading app to emulate real world stock exchange with prices updating every minute and a leaderboard to decide the winner.
    <br />
    <a href="https://github.com/aarav22/trading-app-backend"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <!-- <a href="https://github.com/aarav22/trading-app-backend">View Demo</a> -->
    ·
    <a href="https://github.com/aarav22/trading-app-backend/issues">Report Bug</a>
    ·
    <a href="https://github.com/aarav22/trading-app-backend/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>


<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

This repo only contains the backend to support the transactions, updates in prices and news, leaderboard and other portfolio management.

After the user has been authenticated via Auth0 (whitelisted), they are initialized with a predefined amount of currency. Once the event begins, a floating timer starts counting down to 0s from 60s after which an update in news and prices takes places. User predict the price updates based on the news. Every round also has a limit on the maximum quantity that can be purchased.

After every round the leaderboard is also updated.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![Strapi][Strapi]][Strapi-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

* yarn
  ```sh
  npm install --global yarn
  ```

### Installation

1. Set up a billing account on GCP.
2. Clone the repo
   ```sh
   git clone https://github.com/aarav22/trading-app-backend.git
   ```
3. Install NPM packages
   ```sh
   yarn install
   ```
4. Enter your API Keys in `.env`

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Images
[![product shot 1][product-shot-1]](#)
[![product shot 2][product-shot-2]](#)
<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/aarav22/trading-app-backend.svg?style=for-the-badge
[contributors-url]: https://github.com/aarav22/trading-app-backend/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/aarav22/trading-app-backend.svg?style=for-the-badge
[forks-url]: https://github.com/aarav22/trading-app-backend/network/members
[stars-shield]: https://img.shields.io/github/stars/aarav22/trading-app-backend.svg?style=for-the-badge
[stars-url]: https://github.com/aarav22/trading-app-backend/stargazers
[issues-shield]: https://img.shields.io/github/issues/aarav22/trading-app-backend.svg?style=for-the-badge
[issues-url]: https://github.com/aarav22/trading-app-backend/issues
[license-shield]: https://img.shields.io/github/license/aarav22/trading-app-backend.svg?style=for-the-badge
[license-url]: https://github.com/aarav22/trading-app-backend/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/aarav22
[product-screenshot]: images/buy_img.jpeg
[product-shot-1]: images/port_img.jpeg
[product-shot-2]: images/leader_img.jpeg
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[Strapi]: https://camo.githubusercontent.com/7b181416931b19e4f5c19a139a9f8609621f9b8350f266f543bf19f93c7bf219/68747470733a2f2f7374726170692e696f2f6173736574732f7374726170692d6c6f676f2d6c696768742e737667
[Strapi-url]: https://github.com/strapi/strapi
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 
