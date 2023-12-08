<!-- JavaScript code -->
<script lang='ts'>
  //Script to obtain current year
  const currentYear = (new Date().getFullYear() as unknown) as string;

  //Script to obtian Previous year
  const previousYear = ((new Date().getFullYear() - 1) as unknown) as string;
  
</script>

<!-- Landing Page - Card -->
<div class="flex flex-row items-center justify-center h-screen">

    <!-- Landing Page - Content -->
    <div class=" w-full max-w-7xl h-screen p-10 rounded-md">
        
        <!-- Landing Page - Header -->
        <div class="dropdown dropdown-bottom">
            <div tabindex="0" role="button" class="btn m-1 text-2xl font-semibold normal-case px-6 rounded-full border-none bg-transparent">My Files
                <span>
                    <svg xmlns="http://www.w3.org/2000/svg" height="20" width="14" viewBox="0 0 320 512" fill="#fff">
                        <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
                    </svg>
                </span>
            </div>
            <ul class="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-52 border">
                <li>
                    <a href="/">
                        <svg xmlns="http://www.w3.org/2000/svg" height="16" width="12" viewBox="0 0 384 512" fill="#fff">
                            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"/>
                        </svg>
                         New Folder
                    </a>
                </li>
                <hr>
                <li>
                    <a href="/">
                        <svg xmlns="http://www.w3.org/2000/svg" height="16" width="12" viewBox="0 0 384 512" fill="#fff">
                            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"/>
                        </svg>
                         File Upload
                    </a>
                </li>
                <li>
                    <a href="/">
                        <svg xmlns="http://www.w3.org/2000/svg" height="16" width="12" viewBox="0 0 384 512" fill="#fff">
                            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 408c0 13.3-10.7 24-24 24s-24-10.7-24-24V305.9l-31 31c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l72-72c9.4-9.4 24.6-9.4 33.9 0l72 72c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-31-31V408z"/>
                        </svg>
                         Folder Upload
                    </a>
                </li>
            </ul>
        </div>

        <!-- Dropdown buttons for User -->
        <div>

            <!-- Type Dropdown -->
            <div class="dropdown dropdown-bottom">
                <div tabindex="0" role="button" class="btn m-1 font-semibold normal-case px-6 border-white hover:border-white">Classification
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" height="20" width="14" viewBox="0 0 320 512" fill="#fff">
                            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
                        </svg>
                    </span>
                </div>
                <ul class="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-52 border">
                    <li>
                        <a href="/">
                            Open
                        </a>
                    </li>
                    <hr>
                    <li>
                        <a href="/">
                            Confidential
                        </a>
                    </li>
                    <hr>
                    <li>
                        <a href="/">
                            Secret
                        </a>
                    </li>
                </ul>
            </div>

            <!-- Type Dropdown -->
            <div class="dropdown dropdown-bottom">
                <div tabindex="0" role="button" class="btn m-1 font-semibold normal-case px-6 border-white hover:border-white">Modified
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" height="20" width="14" viewBox="0 0 320 512" fill="#fff">
                            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
                        </svg>
                    </span>
                </div>
                <ul class="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-52 border">
                    <li>
                        <a href="/">
                            Today
                        </a>
                    </li>
                    <li>
                        <a href="/">
                            Last 7 Days
                        </a>
                    </li>
                    <li>
                        <a href="/">
                            Last 30 Days
                        </a>
                    </li>
                    <li>
                        <a href="/">
                            This Year ({currentYear})
                        </a>
                    </li>
                    <li>
                        <a href="/">
                            Last Year ({previousYear})
                        </a>
                    </li>
                </ul>
            </div>

            <!-- Clear All Button -->
            <button class="btn font-semibold normal-case px-6 rounded-full border-none bg-transparent">
                Clear all
            </button>

        </div>

        <div class="overflow-x-auto mt-5">
            <table class="w-full">
                <!-- Table Headers -->
                <thead>
                    <tr class="border-b text-left py-2">  
                        <th class="py-3">
                            Name
                        </th>
                        <th class="py-3">
                            Owner
                        </th>
                        <th class="py-3">
                            Last Modified
                        </th>
                        <th class="py-3">
                            File Size
                        </th>
                        <th class="py-3"></th>
                    </tr>
                </thead>
        
                <!-- Table Body -->
                <tbody>
                    <!-- row 1 -->
                    <tr class="hover:bg-zinc-900 duration-80 border-b text-left py-2">
                        <td class="py-3">
                            Nanyang Poly
                        </td>
                        <td class="py-3">
                            Dezidawk
                        </td>
                        <td class="py-3">
                            Dec 24, 2023 me
                        </td>
                        <td class="py-3">
                            2 KB
                        </td>
                        <th class="text-center">
                            <button class="btn btn-ghost btn-xs">
                                details
                            </button>
                        </th>
                    </tr>
                    <!-- row 2 -->
                    <tr class="hover:bg-zinc-900 duration-80 border-b text-left py-2">
                        <td class="py-3">
                            Dexter's Porn
                        </td>
                        <td class="py-3">
                            Dezidawk
                        </td>
                        <td class="py-3">
                            Aug 26, 2023 me
                        </td>
                        <td class="py-3">
                            111 KB
                        </td>
                        <th class="text-center py-3">
                            <button class="btn btn-ghost btn-xs">
                                details
                            </button>
                        </th>
                    </tr>
                    <!-- row 3 -->
                    <tr class="hover:bg-zinc-900 duration-80 border-b text-left py-2">
                        <td class="py-3">
                            Dr Receipts Pitch
                        </td>
                        <td class="py-3">
                            Dezidawk
                        </td>
                        <td class="py-3">Jan 20, 2022 me

                        </td>
                        <td class="py-3">
                            4 KB
                        </td>
                        <th class="text-center py-3">
                            <button class="btn btn-ghost btn-xs">
                                details
                            </button>
                        </th>
                    </tr>
                    <!-- row 4 -->
                    <tr class="hover:bg-zinc-900 duration-80 border-b text-left py-2">
                        <td class="py-3">
                            Infoseceurity Project
                        </td>
                        <td class="py-3">
                            Dezidawk
                        </td>
                        <td class="py-3">
                            April 5, 2023 me
                        </td>
                        <td class="py-3">
                            15 KB
                        </td>
                        <th class="text-center py-3">
                            <button class="btn btn-ghost btn-xs">
                                details
                            </button>
                        </th>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>