# Changelog

Following is a list of commits (fixes/features only) in this release.

# [0.2.0] - 2026-03-15

## FEATURES

- [1bd73db2](1bd73db23b8368e6cf85ff2eb22f8eab86b4f6ce) resolve nested jobs, imporve memory usage and microcopy appearance
- [6c5c837e](6c5c837e598ab1d658caa9574228f8a19a757538) checkout: ability to add, delete documents, new quick settings look
- [5a1e7035](5a1e7035b41e9afd4d76a73f64eb50350a050f25) home: improve home screen to have a more app like experience
- [acdf2e45](acdf2e451acda8555d1f35341bd622b0b8962f02) prints: implement pdf page rendering
- [c47cff9a](c47cff9a273f3b23b63fa4858d7102e787678f24) settings: add headers to lists
- [25b332d8](25b332d8e44e12ed7a8801b906a70ac3678240ed) summary: use an effect to update transaction status on transaction status changes

## FIXES

- [4c901858](4c9018587a0676551877be7068ce98fa44e0733e) Mixed Color badge was activating when it shouldn't due to mismatch in job's and per-page config's outputColor
- [364d1ed9](364d1ed9e23059f1bda938c4fa2c6f161ed6e08d) back navigation using physical back button
- [cec40687](cec4068702d391da387586035851c86d8b92209b) checkout page and print-options page now handle routing properly
- [103c1206](103c1206bae4d443ac41e088a5499699523b8669) various bug fixes
- [a4a9653f](a4a9653f27debda4f86d4ea681a3233fb002dba2) various fixes across pages
- [cacc402f](cacc402f891da03aac433d709496e6b28d835580) various fixes and improvements
- [b38f67a6](b38f67a63edfd01c5e99f215838de0ecb73f7ae9) various visual improvements in `ios` and `md` mode
- [f64c7809](f64c7809096b2b192275b4ee49989d7873f0859c) checkout: improve checkout UX and UI
- [f5814b26](f5814b265f22d43dc4600d3197217a10ec232f4e) print-options: mobile pdf page rendering
- [023ff89f](023ff89fef7ad41fcc53a30b1bb02b4eed956677) scan-page: double animation while navigating away from scan page
- [8ae09a6b](8ae09a6b51b515a2620eaf50d56ddc0636d97b72) selected-vendor-page: improve appearance printer card
- [4af11d76](4af11d76cef1ef8967521c4efaa34edbea21afab) your-prints: center hasAnyActivity microcopy

## PERFORMANCE

- [c81fb533](c81fb53386d01f31a347b7129412be3809acc678) pdfjslib was being recreated for each change in the draft job

## OTHER

- [ac6b7867](ac6b786723b875e82906d3854a0473946e824eef) update cloud api
- [2b6559c2](2b6559c2af344aa1e120b55ec275055881c4f53f) cliff: include full commit hash, update changelog

# [0.1.0] - 2026-02-25

## FEATURES

- [5ea4557d](5ea4557d8b4bb0b0fae4ebec04ec3a5d104c6b0e) add past prints to the your prints page
- [8004e372](8004e3723507845026cd752244c80dc3a5f2afd5) update vendor presence as an effect if he's not online on checkout page
- [f9879d3e](f9879d3e9f9212d2ff2fca7501be4494a05f88ec) use given name if available
- [64549395](64549395f998ae39b36e0dbffeb034983ba6491f) use presence service to get status of the printer

## FIXES

- [7bb88b5d](7bb88b5d930f0eb2a421ffefcf94b0a83d156d5e) align text better
- [0ee8ca05](0ee8ca057838833b96ad460a5efb14b3b4c6d848) appearance mode
- [08b051c2](08b051c2f8f3a7ecc9d1bd8ed14b0463737e6955) assets, favicons, svg favicons
- [f82ce0c7](f82ce0c72f224761fbfd6e8eca97fe6f4c748003) build
- [4513c37d](4513c37dc71f2c20fb81163d06c445737b1e1548) build
- [6f025445](6f025445e1eef0d8e8460c790749257534acd296) card background in md dark mode
- [9f7dbcd6](9f7dbcd6c0eb0649f6fbb37ddab8248400564d86) cleanup
- [fb9328e2](fb9328e217f3c0ad8b6ed280022d8d46555e2818) cleanup summary page
- [a633fc53](a633fc536ed3c00b5af10ca05a05ed561ad9d093) click registers
- [44bb99c0](44bb99c029ac81e19e40de7b9a841114a13ed568) color of the friendly-id
- [fda20016](fda20016cef129bb707f5b0afebc97bcd14cf3b4) dark and light mode toggle
- [3ac57efa](3ac57efac1f528d1936bf8d80330b3bb8e858a62) displayName was not being fetched correctly
- [ed875313](ed8753135725eb966cdb7fb3ec9d0b039c816899) don't add a spinner while loading
- [4a663671](4a663671e6913c82a42a0c09e310fd33ad71b732) don't hardcode mode
- [f428c5b0](f428c5b0f2a484cda43f235b6060556860e48b96) don't set scroll to false
- [45ccc241](45ccc241c9e22e0e1a3b54ec9d4e848b8d344b57) don't wrap with a div
- [fd09022b](fd09022b34b2686cb9c3865a4668102b03233dbc) errors from api changes
- [2bc40707](2bc407070c1e4739a6e2b748f9f8f2aca32d0715) fab positining
- [1dbb0b6d](1dbb0b6d01179951a2b629333e295e85bc54f3a2) files where not uploading
- [2ebe559d](2ebe559ddcd5c6f29a89fecc2389ad5fdb0fc1f2) inset list and fix toast position
- [c4eb6046](c4eb60467f6e1feaeff08978e13895020a141880) ion-card background on ion-card
- [4c121f89](4c121f898993a02308d8dc057a9f121dad6d8e43) label
- [35b0e8fd](35b0e8fd08bb82c793de823479480943522287b5) light mode background
- [cdc6e847](cdc6e847c3e0fd1e6e7eada8ca691f66f951fcbb) list items now do not need max width constraints
- [bf687945](bf687945092e43f558a8790a1fc8e2bb6e1993c3) list padding
- [b998ad00](b998ad003476683583de83cf4c129d3fc2c179f6) location icon
- [42d940bd](42d940bd2beb14c240cc5cc603349a9f26c74777) microcopy
- [ede38194](ede38194850ba57f3acf3df0f4bc59b14155aaeb) missing prop from pulse icon
- [68b819b8](68b819b840be4285341fdbc380f4fa383734d52b) move search bar out of header
- [173cf89f](173cf89fd32184981d68ee6a9ec0ce88a7fc5511) page navigation was switching tabs
- [f25b8b6c](f25b8b6c0899d7badc13ea73724c036cd00f51ce) position of pulse dot for mode md
- [229cd388](229cd3883e17d08a38a6b5829c75f4f1fd634bfd) presence status
- [e3bdb078](e3bdb0780d5355fe272f887e7dd5502419fe5a70) prints page
- [a7e4eedc](a7e4eedc6d26461837146a039b9ef5bad2d526fc) reduce space between your print cards
- [4a876497](4a876497c295e66a6cc8d528ecff1d90489b69a3) remove icons from card
- [146b7109](146b71097ecf783f8339472d3af1d80b89f06b91) rename tab name
- [bf55a16e](bf55a16e21089628ab2205b789ef1d71c2700b75) scan page
- [54a703de](54a703de8bc52788575622e147240692cafeb6e6) scan page jitter and button positioning
- [867d953e](867d953e2e22c932c4fb8326ce87a8b0c239cc43) segment values
- [80a7b4d5](80a7b4d516a7b71ee81496a3400690b614bf70d5) tab navigation
- [e88f1bca](e88f1bcaa219b1db6645a474d279f6dfee5d9e30) titlebar printers
- [f8a7def9](f8a7def9014c6b7e8f5e6c6186b89098b9c8ba80) transparent toolbar
- [f5675a89](f5675a89d232798d97bedc6d68ccd829f1971b68) upstream api changes
- [32e101ef](32e101efdf979b9c14c84a670818f0d2da712fa3) use equality instead of assignment
- [6ac590ee](6ac590eeda3651eec612eea91f9f8f494f8261e4) use replace instead of push
- [6ba9dfc4](6ba9dfc4df9be620308323647d4b8c6f3c80cf2c) use resolutions to fix react types
- [ecd3d40b](ecd3d40bc194a7fefed03f67b1a980c15d1f849d) use tab name for navigating to checkout page
- [18834246](1883424677e9bf159ed79c6cadbd93f75a830fd1) vendor store now stores more vendor metadata
- [a5e0e257](a5e0e257ccaf0406e94b8aa8c39bc5bfea592137) wrap IonButton with div and make IonFooter direct child of the IonPage

## REFACTOR

- [9b5256c4](9b5256c44c6bd8493fef290fb1a65e5baf9461f5) better file structure
- [fdafacaf](fdafacafd9c87580f17c7be95a41d689cb3b5411) separate tabs from route definition

## DOCUMENTATION

- [95974c83](95974c83ea109da5dd739b7517c262efc86332a9) changelog: v0.1.0

## OTHER

- [86b32efd](86b32efd87155a206437e7744bd2ccbc2d441c37) everywhere
- [02cd45f5](02cd45f57f298377e9330c1c5f8a7cc71b9f0fbd) prettier-plugin-tailwindcss
- [2e5fa7fd](2e5fa7fd1620b89ba0dc522c6e5ecdada85eaf96) printers page
- [41077bfb](41077bfb48e10bac63d0316af72fe7809fa8bcd4) update api spec
- [ba7c0821](ba7c0821ce803a2faade0a60cfee2263a286621f) update api spec
- [697e8072](697e8072660a274bae3f354e6b5d25381e55805b) update api spec
- [42aa6142](42aa6142ac89f195460b5e4057c24567535c4e2e) update api types
- [a9e0ca3c](a9e0ca3cb719a696262c0b47902eb9edaa36645d) update api types
- [af8cff96](af8cff96f6c802495c83191bbd3408c57d584030) update cloud api spec
- [5adb0009](5adb0009651eeb3cfb6735960c092db29fbd0dd3) update cloud api spec
- [ac0fdd77](ac0fdd77f500533e6c7a0f15aaf75a7eea3ec98a) update netlify config to point to new origin
