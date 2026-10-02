$sig = @'
using System;
using System.Runtime.InteropServices;
public class RmLock {
  const int CCH_RM_SESSION_KEY = 32;
  [StructLayout(LayoutKind.Sequential)] public struct RM_UNIQUE_PROCESS { public int dwProcessId; public System.Runtime.InteropServices.ComTypes.FILETIME ProcessStartTime; }
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)] public struct RM_PROCESS_INFO {
    public RM_UNIQUE_PROCESS Process;
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst=256)] public string strAppName;
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst=64)] public string strServiceShortName;
    public uint ApplicationType; public uint AppStatus; public uint TSSessionId; [MarshalAs(UnmanagedType.Bool)] public bool bRestartable;
  }
  [DllImport("rstrtmgr.dll", CharSet=CharSet.Unicode)] static extern int RmStartSession(out uint pSessionHandle, int dwSessionFlags, string strSessionKey);
  [DllImport("rstrtmgr.dll", CharSet=CharSet.Unicode)] static extern int RmRegisterResources(uint pSessionHandle, uint nFiles, string[] rgsFilenames, uint nApplications, IntPtr rgApplications, uint nServices, string[] rgsServiceNames);
  [DllImport("rstrtmgr.dll")] static extern int RmGetList(uint dwSessionHandle, out uint pnProcInfoNeeded, ref uint pnProcInfo, [In, Out] RM_PROCESS_INFO[] rgAffectedApps, ref uint lpdwRebootReasons);
  [DllImport("rstrtmgr.dll")] static extern int RmEndSession(uint pSessionHandle);  public static RM_PROCESS_INFO[] WhoLocks(string path) {
    uint handle; string key=Guid.NewGuid().ToString("N").Substring(0,CCH_RM_SESSION_KEY);
    if(RmStartSession(out handle,0,key)!=0) return new RM_PROCESS_INFO[0];
    try {
      RmRegisterResources(handle,1,new[]{path},0,IntPtr.Zero,0,null);
      uint needed=0,count=0,reasons=0;
      int res=RmGetList(handle,out needed,ref count,null,ref reasons);
      if(res==234){ var arr=new RM_PROCESS_INFO[needed]; count=needed;
        if(RmGetList(handle,out needed,ref count,arr,ref reasons)==0){ Array.Resize(ref arr,(int)count); return arr; }
      }
      return new RM_PROCESS_INFO[0];
    } finally { RmEndSession(handle); }
  }
}
'@
Add-Type $sig
$path='C:\Users\Eduardo Bertei\Desktop\gangster-incremental\index.html'
[RmLock]::WhoLocks($path) | ForEach-Object {
  $p=Get-Process -Id $_.Process.dwProcessId -ErrorAction SilentlyContinue
  [PSCustomObject]@{PID=$_.Process.dwProcessId;App=$_.strAppName;Process=$p.ProcessName;Path=$p.Path}
} | Format-List
