<!-- JavaScript code -->
<script>
    // Your Svelte script here
</script>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home</title>
    <script src="https://kit.fontawesome.com/c850f0d795.js" crossorigin="anonymous"></script>
</head>

<!-- Landing Page - Card -->
<div class="flex items-center justify-center h-screen">

    <!-- Landing Page - Content -->
    <div class="w-11/12 h-screen p-10 border border-secondary rounded-md shadow-lg">
        
        <!-- Landing Page - Header -->
        <div class="dropdown dropdown-bottom">
            <div tabindex="0" role="button" class="btn m-1 text-2xl font-semibold normal-case px-6 rounded-full border-none bg-transparent">My Files
                <span>
                    <i class="fa-solid fa-caret-down "></i>
                </span>
            </div>
            <ul class="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-52 border">
                <li><a href="/"><i class="fa-solid fa-folder"></i> New Folder</a></li>
                <hr>
                <li><a href="/"><i class="fa-solid fa-file-arrow-up"></i> File Upload</a></li>
                <li><a href="/"><i class="fa-solid fa-file-arrow-up"></i> Folder Upload</a></li>
            </ul>
        </div>

        <!-- Dropdown buttons for User -->
        <div>

            <!-- Type Dropdown -->
            <div class="dropdown dropdown-bottom">
                <div tabindex="0" role="button" class="btn m-1 font-semibold normal-case px-6 border-white hover:border-white">Classification
                    <span>
                        <i class="fa-solid fa-caret-down "></i>
                    </span>
                </div>
                <ul class="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-52 border">
                    <li><a href="/"><i class="fa-solid fa-folder"></i>Open Class</a></li>
                    <hr>
                    <li><a href="/"><i class="fa-solid fa-folder"></i>Confidential Class</a></li>
                    <hr>
                    <li><a href="/"><i class="fa-solid fa-folder"></i>Secret Class</a></li>
                </ul>
            </div>

            <!-- Type Dropdown -->
            <div class="dropdown dropdown-bottom">
                <div tabindex="0" role="button" class="btn m-1 font-semibold normal-case px-6 border-white hover:border-white">Modified
                    <span>
                        <i class="fa-solid fa-caret-down "></i>
                    </span>
                </div>
                <ul class="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-52 border">
                    <li><a href="/"><i class="fa-solid fa-folder"></i>Today</a></li>
                    <li><a href="/"><i class="fa-solid fa-folder"></i>Last 7 Days</a></li>
                    <li><a href="/"><i class="fa-solid fa-folder"></i>Last 30 Days</a></li>
                    <li><a href="/"><i class="fa-solid fa-folder"></i>This Year (2023)</a></li>
                    <li><a href="/"><i class="fa-solid fa-folder"></i>Last Year (2022)</a></li>
                </ul>
            </div>

            <!-- Clear All Button -->
            <button class="btn font-semibold normal-case px-6 rounded-full border-none bg-transparent">Clear all</button>

        </div>

        <div class="overflow-x-auto mt-5">
            <table class="w-full">
                <!-- Table Headers -->
                <thead>
                    <tr class="border-b text-left py-2">  
                        <th class="py-3">Name</th>
                        <th class="py-3">Owner</th>
                        <th class="py-3">Last Modified</th>
                        <th class="py-3">File Size</th>
                        <th class="py-3"></th>
                    </tr>
                </thead>
        
                <!-- Table Body -->
                <tbody>
                    <!-- row 1 -->
                    <tr class="hover:bg-zinc-900 duration-80 border-b text-left py-2">
                        <td class="py-3">Nanyang Poly</td>
                        <td class="py-3">Dezidawk</td>
                        <td class="py-3">Dec 24, 2023 me</td>
                        <td class="py-3">2 KB</td>
                        <th class="text-center">
                            <button class="btn btn-ghost btn-xs">details</button>
                        </th>
                    </tr>
                    <!-- row 2 -->
                    <tr class="hover:bg-zinc-900 duration-80 border-b text-left py-2">
                        <td class="py-3">Dexter's Porn</td>
                        <td class="py-3">Dezidawk</td>
                        <td class="py-3">Aug 26, 2023 me</td>
                        <td class="py-3">111 KB</td>
                        <th class="text-center py-3">
                            <button class="btn btn-ghost btn-xs">details</button>
                        </th>
                    </tr>
                    <!-- row 3 -->
                    <tr class="hover:bg-zinc-900 duration-80 border-b text-left py-2">
                        <td class="py-3">Dr Receipts Pitch</td>
                        <td class="py-3">Dezidawk</td>
                        <td class="py-3">Jan 20, 2022 me</td>
                        <td class="py-3">4 KB</td>
                        <th class="text-center py-3">
                            <button class="btn btn-ghost btn-xs">details</button>
                        </th>
                    </tr>
                    <!-- row 4 -->
                    <tr class="hover:bg-zinc-900 duration-80 border-b text-left py-2">
                        <td class="py-3">Infoseceurity Project</td>
                        <td class="py-3">Dezidawk</td>
                        <td class="py-3">April 5, 2023 me</td>
                        <td class="py-3">15 KB</td>
                        <th class="text-center py-3">
                            <button class="btn btn-ghost btn-xs">details</button>
                        </th>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>