// https://github.com/EmbarkStudios/texture-synthesis
// WIP - not usable out of the box yet!

var plugin = new arm.Plugin();
var h1 = plugin.handle();

var wasmbin = Krom.loadBlob("data/plugins/plugin_texsynt_2048.wasm");
var module = new WebAssembly.Module(wasmbin);
var exports = new WebAssembly.Instance(module).exports;

plugin.drawUI = function(ui) {
	if (ui.panel(h1, "Texture Synthesis")) {
		if (ui.button("Make Tiling")) {
			var addr_img = exports.main_img();
			var addr_img_tile = exports.main_img_tile();
			init_image(exports.memory.buffer, addr_img, addr_img_tile);
			var addr_out = exports.main_tiling();
			write_texture(exports.memory.buffer, addr_out);
		}
	}
};

let init_image = function(ab:js.lib.ArrayBuffer, addr_img:Int, addr_img_tile:Int) {
	var l = Project.layers[0];
	var bytes = l.texpaint.getPixels();
	var bytesTile = l.texpaint_pack.getPixels();
	var view = new js.lib.Uint8Array(ab);
	var res = Config.getTextureRes();
	for (i in 0...res*res*4) {
		view[i + addr_img] = bytes.get(i);
		view[i + addr_img_tile] = bytesTile.get(Std.int(i/4)*4);
	}
};

let write_texture = function(ab:js.lib.ArrayBuffer, addr:Int) {
	var res = Config.getTextureRes();
	var pixels = haxe.io.Bytes.alloc(res*res*4);
	var view = new js.lib.Uint8Array(ab);
	for (i in 0...res*res*4) {
		pixels.set(i, view[i + addr]);
	}
	arm.io.Exporter.writeTexture(path, pixels);
};
