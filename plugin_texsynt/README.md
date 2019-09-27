# texture-synthesis

https://github.com/EmbarkStudios/texture-synthesis

Rust Notes:
- Run `cargo install wasm-pack`.
- In `Cargo.toml`:
```
[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
```
- No threading for rust->wasm yet. :( Comment out [#1](https://github.com/EmbarkStudios/texture-synthesis/blob/cd3ca527e8319072b09597ba22d32f71dec44280/lib/src/multires_stochastic_texture_synthesis.rs#L783) and [#2](https://github.com/EmbarkStudios/texture-synthesis/blob/cd3ca527e8319072b09597ba22d32f71dec44280/lib/src/multires_stochastic_texture_synthesis.rs#L785).
- `wasm-pack build` to build.
- C-like / unsafe Rust bindings prototype (do not do this, proof of concept only):
```rs
extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

// These are accessible as WebAssembly memory
static mut MEM_IMAGE: [u8; 512*512*4] = [0; 512*512*4];
static mut MEM_TILE: [u8; 512*512*4] = [0; 512*512*4];

// Retrieve WebAssembly memory address
#[wasm_bindgen]
pub fn get_image_mem() -> *const u8 { unsafe { MEM_IMAGE.as_ptr() } }

#[wasm_bindgen]
pub fn get_tile_mem() -> *const u8 { unsafe { MEM_TILE.as_ptr() } }

#[wasm_bindgen]
pub fn make_tiling() -> *const u8 {
    unsafe {
        // MEM_IMAGE and MEM_TILE is supposed to be filled with image pixels now
        let image_buffer = image::ImageBuffer::from_raw(512, 512, MEM_IMAGE.to_vec()).unwrap();
        let tile_buffer = image::ImageBuffer::from_raw(512, 512, MEM_TILE.to_vec()).unwrap();
        let image = image::DynamicImage::ImageRgba8(image_buffer);
        let tile = image::DynamicImage::ImageRgba8(tile_buffer);
        let texsynth = Session::builder()
            .inpaint_example(tile, Example::new(image))
            .resize_input(512, 512)
            .output_size(512, 512)
            .tiling_mode(true)
            .build().unwrap();
        let generated = texsynth.run(None);
        let pixels = generated.into_image().raw_pixels();
        // Perhaps copy the pixels into MEM_OUTPUT first and return MEM_OUTPUT.as_ptr()
        pixels.as_ptr()
    }
}
```
