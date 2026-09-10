package helper

import "bytes"

// RewriteImageURLs 把响应里上游图片 CDN 域名替换成我们自己的反代域名，
// 客户端拿到的图片链接走本站（otterl.com），不暴露上游域名。
// 配合 nginx 的 /i/ 反代路由（otterl.com/i/* -> draw.dragtokens.com/i/*）使用。
func RewriteImageURLs(body []byte) []byte {
	if !bytes.Contains(body, []byte("draw.dragtokens.com")) {
		return body
	}
	body = bytes.ReplaceAll(body, []byte("https://draw.dragtokens.com"), []byte("https://otterl.com"))
	body = bytes.ReplaceAll(body, []byte("http://draw.dragtokens.com"), []byte("https://otterl.com"))
	return body
}
