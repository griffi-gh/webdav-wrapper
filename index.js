import { createClient } from 'webdav';

function getEncodingName(encoding) {
	encoding = String(encoding).toLowerCase().trim();
	return (encoding == 'utf8' || encoding == 'text') ? 'text' : 'binary';
}

export default function сreateAdapter(url,options = {}) {
	options.username = options.username || '.';
	options.password = options.password || '.';
	options.maxContentLength = (options.maxContentLength || (1024 * 1024 * 1024)) | 0;
	const client = createClient(url,options);
	const wrapper = {};

	wrapper.readFile = function(path, encoding, callback) {
		if((arguments.length === 2) && (typeof(encoding) === 'function')) {
			callback = encoding;
			encoding = 'text';
		} else {
			encoding = getEncodingName(encoding || 'binary');
		}
		if(typeof(callback) !== 'function') callback = f=>0;
		if(!path) throw new Error('Path not specified');
		client.getFileContents(path, {
			format: encoding,
			maxContentLength: options.maxContentLength
		}).then(
			data => callback(false, data)
		).catch(
			err => callback(err, null)
		);
	}

	wrapper.writeFile = function(path, data, encoding, callback) {
		if((arguments.length === 3) && (typeof(encoding) === 'function')) {
			callback = encoding;
			encoding = 'text';
		} else {
			encoding = getEncodingName(encoding || 'binary');
		}
		if(encoding == 'binary') {
			data = Buffer.from(data);
		} else {
			data = String(data);
		}
		if(typeof(callback) !== 'function') callback = f=>0;
		if(!path) throw new Error('Path not specified');
		client.putFileContents(path, data, {
			overwrite: true,
			maxContentLength: options.maxContentLength
		}).then(
			() => callback(false)
		).catch(
			err => callback(err || true)
		);
	}
	
	wrapper.unlink = function(path, callback) {
		if(typeof(callback) !== 'function') callback = f=>0;
		if(!path) throw new Error('Path not specified');
		client.deleteFile(path).then(
			() => callback(false)
		).catch(
			err => callback(err || true)
		)
	}

	wrapper.mkdir = function(path, callback) {
		if(typeof(callback) !== 'function') callback = f=>0;
		if(!path) throw new Error('Path not specified');
		client.createDirectory(path, {recursive: true}).then(
			() => callback(false)
		).catch(
			err => callback(err || true)
		);
	}

	return wrapper;
}
