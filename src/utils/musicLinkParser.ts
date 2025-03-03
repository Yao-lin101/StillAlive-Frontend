/**
 * 网易云音乐链接解析工具
 * 支持多种格式的网易云音乐分享链接，提取音乐ID并生成标准化的嵌入链接
 */

// 网易云音乐嵌入播放器的基础URL
const NETEASE_EMBED_BASE_URL = 'https://music.163.com/outchain/player?type=2&id=';
const NETEASE_AUTO_PLAY = '&auto=1&height=66';

/**
 * 从网易云音乐分享链接中提取音乐ID
 * 支持的链接格式:
 * 1. https://music.163.com/#/song?id=1234567
 * 2. https://music.163.com/song?id=1234567
 * 3. http://music.163.com/song/1234567/
 * 4. https://y.music.163.com/m/song?id=1234567
 * 5. 分享链接: https://y.music.163.com/m/song/1234567/?...
 * 6. 移动端分享链接: https://m.music.163.com/...
 * 7. 网易云音乐APP分享的短链接
 * 
 * @param link 用户输入的网易云音乐链接
 * @returns 解析后的标准嵌入链接，如果解析失败则返回null
 */
export function parseNeteaseMusicLink(link: string): string | null {
  console.log('解析网易云音乐链接:', link);
  
  if (!link || typeof link !== 'string') {
    console.log('链接为空或不是字符串');
    return null;
  }

  // 清理链接，移除多余空格
  const cleanLink = link.trim();
  console.log('清理后的链接:', cleanLink);
  
  // 如果已经是嵌入链接格式，直接返回
  if (cleanLink.startsWith(NETEASE_EMBED_BASE_URL)) {
    console.log('已经是嵌入链接格式:', cleanLink);
    return cleanLink;
  }

  // 尝试提取音乐ID
  let musicId: string | null = null;

  // 正则表达式匹配各种可能的链接格式
  const idPatterns = [
    // 标准网页链接 ?id= 格式
    /music\.163\.com\/(?:#\/)?song\?id=(\d+)/i,
    // 路径格式 /song/id/
    /music\.163\.com\/song\/(\d+)/i,
    // 移动端链接
    /y\.music\.163\.com\/m\/song(?:\/)?(\d+)?(?:\/|\?id=)(\d+)?/i,
    // 移动端 m.music.163.com
    /m\.music\.163\.com\/.*[?&]id=(\d+)/i
  ];

  // 尝试所有正则表达式
  for (const pattern of idPatterns) {
    const match = cleanLink.match(pattern);
    if (match) {
      // 根据不同的匹配组获取ID
      musicId = match[1] || match[2];
      console.log('匹配到ID:', musicId, '使用模式:', pattern);
      break;
    }
  }

  // 如果没有匹配到ID，尝试从文本中提取纯数字（可能是ID）
  if (!musicId && /song.*?(\d{5,})/.test(cleanLink)) {
    const match = cleanLink.match(/song.*?(\d{5,})/);
    if (match) {
      musicId = match[1];
      console.log('从文本中提取到ID:', musicId);
    }
  }

  // 如果成功提取到音乐ID，生成标准嵌入链接
  if (musicId) {
    const result = `${NETEASE_EMBED_BASE_URL}${musicId}${NETEASE_AUTO_PLAY}`;
    console.log('生成的嵌入链接:', result);
    return result;
  }

  // 解析失败
  console.log('解析失败，无法提取音乐ID');
  return null;
}

/**
 * 检查链接是否为有效的网易云音乐链接
 * 
 * @param link 用户输入的链接
 * @returns 是否为有效的网易云音乐链接
 */
export function isValidNeteaseMusicLink(link: string): boolean {
  return !!parseNeteaseMusicLink(link);
}

/**
 * 从嵌入链接中提取音乐ID
 * 
 * @param embedLink 嵌入链接
 * @returns 音乐ID
 */
export function extractMusicIdFromEmbed(embedLink: string): string | null {
  if (!embedLink) return null;
  
  const match = embedLink.match(/id=(\d+)/);
  return match ? match[1] : null;
} 