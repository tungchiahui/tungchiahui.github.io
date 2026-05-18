export const MUSIC_SERVER = 'tencent'
export const MUSIC_PLAYLIST_TYPE = 'playlist'
export const MUSIC_PLAYLIST_ID = '9619599108'
// export const METING_API = 'https://music.3e0.cn/?server=:server&type=:type&id=:id'
export const METING_API = 'https://meting-api.u2sb.com/?server=:server&type=:type&id=:id'

export const CDN_AUDIO_BY_ID: Record<string, string> = {
  // Example:
  'tencent:000DNTXj0gJF8O': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/马也_Crabbit%20Cole先生-海屿你.mp3',
  'tencent:003lWqv52x5LTX': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/转年轮-joysaaaa.mp3',
  'tencent:003TKeig0mQSE4': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/我还是想再问你-于睿迪.mp3',
  'tencent:003Hqdah3PCoMh': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/梦-温舒娴.mp3',
  'tencent:002TPhYX0GXc9i': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/雨散-你的星冰乐.mp3',
  'tencent:001m9RzL40omqi': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/I%20Will%20Never%20Let%20You%20Down-Rita%20Ora.mp3',
  'tencent:003DDwAx2tCXWn': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/怎么唱情歌-刘惜君.mp3',
  'tencent:003N7qbb2oHqUk': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/晚风心里吹-阿梨粤.mp3',
  'tencent:001SkJMR3SWoS3': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/不说%20(路过版)-李荣浩.mp3',
  'tencent:0005V86C0UqNOW': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/绝口不提-ycccc.mp3',
  'tencent:0034AJQi1wsM1r': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/无条件为你-梁静茹.mp3',
  'tencent:002TuiTx2Xh6oN': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/不可能事件-joysaaaa.mp3',
  'tencent:003qVhV91cj03R': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/圆%20(Time%20After%20Time)-BoA.WENDY.NINGNING.mp3',
  'tencent:0047tzaU3jweDH': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/我只在乎你-邓丽君.mp3',
  'tencent:004Jl2Xh1rFBna': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/星落-丁溪.mp3',
  'tencent:003piM753uRsvW': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/没离开过-林志炫.mp3',
  'tencent:004EEOpH27pnbB': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/悲情人物-陈小满.庄淇玟29.mp3',
  'tencent:003cSLOO35W3yP': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/特别的人-方大同.mp3',
  'tencent:004VIIJe2DmQqt': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/无人海-苏晗.mp3',
  'tencent:0029vb0r2T9PE4': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/跳楼机-LBI利比.mp3',
  'tencent:002nraBm3LhdUm': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/PLAYING%20WITH%20FIRE%20(불장난)-BLACKPINK.mp3',
  'tencent:003mVERF2THBiE': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/MOONLIGHT-HENRY刘宪华.mp3',
  'tencent:0038HM2J2C2T36': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/落在生命里的光-尹昔眠.mp3',
  'tencent:00333VYG3eXFtv': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/深院外-阿YueYue.戾格.小田音乐社.mp3',
  'tencent:003lx2pR2PeOPi': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/晴天下雨-ATK.橙汁.P40林康鉴.mp3',
}

export const PLAYLIST_API = METING_API
  .replace(':server', encodeURIComponent(MUSIC_SERVER))
  .replace(':type', encodeURIComponent(MUSIC_PLAYLIST_TYPE))
  .replace(':id', encodeURIComponent(MUSIC_PLAYLIST_ID))
