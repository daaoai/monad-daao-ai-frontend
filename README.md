<!-- Improved compatibility of back to top link: See: https://github.com/daaoai/daao_ai_frontend_v2/pull/73 -->

<a id="readme-top"></a>

<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

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
[![Unlicense License][license-shield]][license-url]

<!-- [![LinkedIn][linkedin-shield]][linkedin-url] -->

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/daaoai/daao_ai_frontend_v2">
    <img src="./public/assets/roman-guy.svg" alt="Logo" width="200" height="200">
  </a>

  <h3 align="center">DAAO.ai</h3>

  <p align="center">
    Where autonomous agents meet decentralised innovation
    <br />
    <a href="https://github.com/daaoai/daao_ai_frontend_v2/wiki"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <!-- <a href="https://github.com/daaoai/daao_ai_frontend_v2">View Demo</a> -->
    <!-- &middot; -->
    <a href="https://github.com/daaoai/daao_ai_frontend_v2/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/daaoai/daao_ai_frontend_v2/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
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
    <li><a href="#contributing">Contributing</a></li>
  </ol>
</details>
 
---

<!-- # **Next.js + Rainbowkit + SIWE + shadcn** -->

<!-- Live Demo: [link-here](link-here) -->

<!-- ABOUT THE PROJECT -->

## About The Project

![Product Name Screen Shot](http://0x0.st/8ZlG.png)

A **Next.js** frontend for the DAAO project, powered by **TypeScript**, **RainbowKit**, **Wagmi**, **Shadcn**, and **TailwindCSS**.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org)
[![Wagmi](https://img.shields.io/badge/Wagmi-000?logo=wagmi&logoColor=fff)](https://wagmi.sh)
[![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000?logo=shadcnui&logoColor=fff)](https://shadcn.dev)
[![React Query](https://img.shields.io/badge/React%20Query-FF4154?logo=reactquery&logoColor=fff)](https://tanstack.com/query/latest)
[![Bun](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=fff)](https://bun.sh)

and more!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- --- -->
<!---->
<!-- ## ✨ **What's Included** -->
<!---->
<!-- Includes the following features: -->
<!---->
<!-- - **Next.js** with **TypeScript**: Full TypeScript support for modern, scalable applications. -->
<!-- - **RainbowKit + Wagmi**: Seamless Ethereum wallet connection and Web3 functionality with built-in wallet UI. -->
<!-- - **SIWE (Sign-In With Ethereum)**: Pre-configured authentication solution for decentralized logins using NextAuth. -->
<!-- - **TailwindCSS**: A utility-first CSS framework for fast and responsive design. -->
<!-- - **Shadcn Components**: A customizable component library built on TailwindCSS for building modern UIs. -->
<!-- - **Theme Toggle**: Dark/light mode toggler with TailwindCSS-based theme switching. -->
<!-- - **React Query**: Integrated for managing server state and caching. -->
<!-- - **NextAuth**: Secure authentication setup, with support for Web3-based logins. -->
<!-- - **Bun** for Fast Package Management: Support for Bun to speed up dependency installation and script execution. -->

---

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

This project uses Bun for managing dependencies. If you don't have Bun installed, follow the installation instructions [here](https://bun.sh/docs/installation).

### Installation

1. **Clone via CLI:**

   Alternatively, you can clone the repository using the CLI:

   ```bash
   git clone https://github.com/daaoai/daao_ai_frontend_v2.git daao_frontend
   cd daao_frontend

   ```

- Once Bun is installed, run:

  ```bash
  bun install
  ```

- Set up Environment Variables:

  Copy the .env.example file to .env.local and update the variables as needed:

  ```bash
  cp .env.example .env.local
  ```

- Start the development server:

  - Make sure you do this from the root of the project and not from some subdirectory

  ```bash
  bun run dev
  ```

  - To build the project instead do

  ```sh
  bun run build
  bun run start
  ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

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

> first merge your branch with the `dev` branch and checkout deployment status etc at [dev.daao.ai](https://dev.daao.ai), only then open a pr to merge with main

### Top contributors:

<a href="https://github.com/daaoai/daao_ai_frontend_v2/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=daaoai/daao_ai_frontend_v2" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/daaoai/daao_ai_frontend_v2.svg?style=for-the-badge
[contributors-url]: https://github.com/daaoai/daao_ai_frontend_v2/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/daaoai/daao_ai_frontend_v2.svg?style=for-the-badge
[forks-url]: https://github.com/daaoai/daao_ai_frontend_v2/network/members
[stars-shield]: https://img.shields.io/github/stars/daaoai/daao_ai_frontend_v2.svg?style=for-the-badge
[stars-url]: https://github.com/daaoai/daao_ai_frontend_v2/stargazers
[issues-shield]: https://img.shields.io/github/issues/daaoai/daao_ai_frontend_v2.svg?style=for-the-badge
[issues-url]: https://github.com/daaoai/daao_ai_frontend_v2/issues
[license-shield]: https://img.shields.io/github/license/daaoai/daao_ai_frontend_v2.svg?style=for-the-badge
[license-url]: https://github.com/daaoai/daao_ai_frontend_v2/blob/master/LICENSE.txt

<!-- [linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555 -->
<!-- [linkedin-url]: https://linkedin.com/in/othneildrew -->

[product-screenshot]: images/screenshot.png
