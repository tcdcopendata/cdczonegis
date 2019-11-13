/* ---------------------------------------------------------------------- */
/*
 * Active X error code define
 */
//HCA
var FS_RTN_SUCCESS = 0;
var HCA_E_UNSUPPORT_FUNC = 30001;
var FSCARD_RTN_CONNECT_FAIL = 3001;
var FSCARD_RTN_SELECT_APPLET_FAIL = 3002;
var HCA_E_FAIL_TO_VERIFY_PIN = 30022;
var HCA_E_FAIL_TO_TS_Query = 30029;
var FSCARD_RTN_ESTABLISH_CONTEXT_FAIL = 3003;
var HCA_E_FAIL_TO_TS_Verify = 30030;
var HCA_E_FAIL_TO_GetCertAttrib = 30033;
var HCA_E_FAIL_TO_GetTSInfo = 30034;
var HCA_E_FAIL_TO_CertValidate = 30036;
var HCA_E_FAIL_TO_CheckCard = 30037;
var HCA_E_FAIL_TO_PIN_INCORRECT = 30040;
var HCA_E_FAIL_TO_PIN_LOCK = 30041;
var FSCARD_RTN_CARD_STATUS_ERROR = 3004;
var FSCARD_RTN_CARD_ABSENT = 3005;
var FSCARD_RTN_TRANSMIT_ERROR = 3006;
var FSCARD_RTN_GET_DATA_ERROR = 3007;
var FSCARD_RTN_LOGIN_FAIL = 3008;
var FSCARD_RTN_READERS_BUFFER_FAIL = 3009;
var FSCARD_RTN_GET_READERS_FAIL = 3010;
var FSCARD_RTN_NO_READER = 3011;
var FSCARD_RTN_MEMALLOC_ERROR = 3012;
var FSCARD_RTN_LIST_READERS_ERROR = 3013;
var FSCARD_RTN_CHAR2WCHAR_ERROR = 3014;
var FSCARD_RTN_WCHAR2CHAR_ERROR = 3015;
var FSCARD_RTN_INVALID_PARAM = 3016;
var FSCARD_RTN_LIB_EXPIRE = 3017;
var FSCARD_RTN_GEN_PKCS7_FAIL = 3018;
var FSCARD_RTN_DATA_HASH_ERROR = 3019;
var FSCARD_RTN_PIN_LENGTH_ERROR = 3020;
var FSCARD_RTN_PIN_LOCK = 3021;
var FSCARD_RTN_USER_ALREADY_LOGGED_IN = 3033;
var FSCARD_RTN_UNKNOWN_ERROR = 3999;


//PKCS#11
var FSP11_RTN_OK = 0;
var FSP11_RTN_CANCEL = 9001;
var FSP11_RTN_HOST_MEMORY = 9002;
var FSP11_RTN_SLOT_ID_INVALID = 9003;
var FSP11_RTN_GENERAL_ERROR = 9004;
var FSP11_RTN_FUNCTION_FAILED = 9005;
var FSP11_RTN_ARGUMENTS_BAD = 9006;
var FSP11_RTN_NO_EVENT = 9007;
var FSP11_RTN_NEED_TO_CREATE_THREADS = 9008;
var FSP11_RTN_CANT_LOCK = 9009;
var FSP11_RTN_ATTRIBUTE_READ_ONLY = 9010;
var FSP11_RTN_ATTRIBUTE_SENSITIVE = 9011;
var FSP11_RTN_ATTRIBUTE_TYPE_INVALID = 9012;
var FSP11_RTN_ATTRIBUTE_VALUE_INVALID = 9013;
var FSP11_RTN_DATA_INVALID = 9014;
var FSP11_RTN_DATA_LEN_RANGE = 9015;
var FSP11_RTN_DEVICE_ERROR = 9016;
var FSP11_RTN_DEVICE_MEMORY = 9017;
var FSP11_RTN_DEVICE_REMOVED = 9018;
var FSP11_RTN_ENCRYPTED_DATA_INVALID = 9019;
var FSP11_RTN_ENCRYPTED_DATA_LEN_RANGE = 9020;
var FSP11_RTN_FUNCTION_CANCELED = 9021;
var FSP11_RTN_FUNCTION_NOT_PARALLEL = 9022;
var FSP11_RTN_FUNCTION_NOT_SUPPORTED = 9023;
var FSP11_RTN_KEY_HANDLE_INVALID = 9024;
var FSP11_RTN_KEY_SIZE_RANGE = 9025;
var FSP11_RTN_KEY_TYPE_INCONSISTENT = 9026;
var FSP11_RTN_KEY_NOT_NEEDED = 9027;
var FSP11_RTN_KEY_CHANGED = 9028;
var FSP11_RTN_KEY_NEEDED = 9029;
var FSP11_RTN_KEY_INDIGESTIBLE = 9030;
var FSP11_RTN_KEY_FUNCTION_NOT_PERMITTED = 9031;
var FSP11_RTN_KEY_NOT_WRAPPABLE = 9032;
var FSP11_RTN_KEY_UNEXTRACTABLE = 9033;
var FSP11_RTN_MECHANISM_INVALID = 9034;
var FSP11_RTN_MECHANISM_PARAM_INVALID = 9035;
var FSP11_RTN_OBJECT_HANDLE_INVALID = 9036;
var FSP11_RTN_OPERATION_ACTIVE = 9037;
var FSP11_RTN_OPERATION_NOT_INITIALIZED = 9038;
var FSP11_RTN_PIN_INCORRECT = 9039;
var FSP11_RTN_PIN_INVALID = 9040;
var FSP11_RTN_PIN_LEN_RANGE = 9041;
var FSP11_RTN_PIN_EXPIRED = 9042;
var FSP11_RTN_PIN_LOCKED = 9043;
var FSP11_RTN_SESSION_CLOSED = 9044;
var FSP11_RTN_SESSION_COUNT = 9045;
var FSP11_RTN_SESSION_HANDLE_INVALID = 9046;
var FSP11_RTN_SESSION_PARALLEL_NOT_SUPPORTED = 9047;
var FSP11_RTN_SESSION_READ_ONLY = 9048;
var FSP11_RTN_SESSION_EXISTS = 9049;
var FSP11_RTN_SESSION_READ_ONLY_EXISTS = 9050;
var FSP11_RTN_SESSION_READ_WRITE_SO_EXISTS = 9051;
var FSP11_RTN_SIGNATURE_INVALID = 9052;
var FSP11_RTN_SIGNATURE_LEN_RANGE = 9053;
var FSP11_RTN_TEMPLATE_INCOMPLETE = 9054;
var FSP11_RTN_TEMPLATE_INCONSISTENT = 9055;
var FSP11_RTN_TOKEN_NOT_PRESENT = 9056;
var FSP11_RTN_TOKEN_NOT_RECOGNIZED = 9057;
var FSP11_RTN_TOKEN_WRITE_PROTECTED = 9058;
var FSP11_RTN_UNWRAPPING_KEY_HANDLE_INVALID = 9059;
var FSP11_RTN_UNWRAPPING_KEY_SIZE_RANGE = 9060;
var FSP11_RTN_UNWRAPPING_KEY_TYPE_INCONSISTENT = 9061;
var FSP11_RTN_USER_ALREADY_LOGGED_IN = 9062;
var FSP11_RTN_USER_NOT_LOGGED_IN = 9063;
var FSP11_RTN_USER_PIN_NOT_INITIALIZED = 9064;
var FSP11_RTN_USER_TYPE_INVALID = 9065;
var FSP11_RTN_USER_ANOTHER_ALREADY_LOGGED_IN = 9066;
var FSP11_RTN_USER_TOO_MANY_TYPES = 9067;
var FSP11_RTN_WRAPPED_KEY_INVALID = 9068;
var FSP11_RTN_WRAPPED_KEY_LEN_RANGE = 9069;
var FSP11_RTN_WRAPPING_KEY_HANDLE_INVALID = 9070;
var FSP11_RTN_WRAPPING_KEY_SIZE_RANGE = 9071;
var FSP11_RTN_WRAPPING_KEY_TYPE_INCONSISTENT = 9072;
var FSP11_RTN_RANDOM_SEED_NOT_SUPPORTED = 9073;
var FSP11_RTN_RANDOM_NO_RNG = 9074;
var FSP11_RTN_BUFFER_TOO_SMALL = 9075;
var FSP11_RTN_SAVED_STATE_INVALID = 9076;
var FSP11_RTN_INFORMATION_SENSITIVE = 9077;
var FSP11_RTN_STATE_UNSAVEABLE = 9078;
var FSP11_RTN_CRYPTOKI_NOT_INITIALIZED = 9079;
var FSP11_RTN_CRYPTOKI_ALREADY_INITIALIZED = 9080;
var FSP11_RTN_MUTEX_BAD = 9081;
var FSP11_RTN_MUTEX_NOT_LOCKED = 9082;
var FSP11_RTN_VENDOR_DEFINED = 9083;

var FSP11_RTN_MEMORY_ALLOCATE_FAIL = 5002;
var FSP11_RTN_OBJECT_NOT_EXIST = 9100;
var FSP11_RTN_OBJECT_EXIST = 9101;
var FSP11_RTN_OBJECT_HAS_PROBLEM = 9102;
var FSP11_RTN_LOAD_LIBRARY_FAIL = 9110;
var FSP11_RTN_LIBRARY_NOT_LOAD = 9111;
var FSP11_RTN_SLOT_NOT_FOUND = 9112;

var FSP11_RTN_FORCE_USER_CHANGE_PIN = 9990;
var FSP11_RTN_UNKNOW_ERROR = 9999;


//openSSL
var FS_RTN_SUCCESS = 0;
var FS_RTN_ERROR = 5001;
var FS_RTN_MEMALLOC_ERROR = 5002;
var FS_RTN_BUFFER_TOO_SMALL = 5003;
var FS_RTN_FUNCTION_UNSUPPORT = 5004;
var FS_RTN_INVALID_PARAM = 5005;
var FS_RTN_INVALID_HANDLE = 5006;
var FS_RTN_LIB_EXPIRE = 5007;
var FS_RTN_BASE64_ERROR = 5008;

var FS_RTN_CERT_NOT_FOUND = 5010;
var FS_RTN_CERT_EXPIRED = 5011;
var FS_RTN_CERT_NOT_YET_VALID = 5012;
var FS_RTN_CERT_EXPIRE_OR_NOT_YET_USE = 5013;
var FS_RTN_CERT_DENIED = 5014;
var FS_RTN_CERT_NOISSUER = 5015;
var FS_RTN_CERT_BAD_SIGNATURE = 5016;
var FS_RTN_CERT_INVALID_KEYUSAGE = 5017;

var FS_RTN_CERT_REVOKED = 5020;
var FS_RTN_CERT_UNSPECIFIED = 5020;
var FS_RTN_CERT_KEY_COMPROMISED = 5021;
var FS_RTN_CERT_CA_COMPROMISED = 5022;
var FS_RTN_CERT_AFFILIATION_CHANGED = 5023;
var FS_RTN_CERT_SUPERSEDED = 5024;
var FS_RTN_CERT_CESSATION = 5025;
var FS_RTN_CERT_HOLD = 5026;
var FS_RTN_CERT_REMOVEFROMCRL = 5028;

var FS_RTN_CRL_EXPIRED = 5030;
var FS_RTN_CRL_NOT_YET_VALID = 5031;
var FS_RTN_CRL_NOT_FOUND = 5032;
var FS_RTN_CRL_BAD_SIGNATURE = 5034;

var FS_RTN_GET_DIGEST_ERROR = 5035;
var FS_RTN_BAD_SIGNATURE = 5036;
var FS_RTN_BAD_CONTENT = 5037;

var FS_RTN_INVALID_CERT = 5040;
var FS_RTN_INVALID_CRL = 5041;
var FS_RTN_INVALID_PKCS7 = 5042;
var FS_RTN_INVALID_KEY = 5043;
var FS_RTN_INVALID_CERTREQ = 5044;
var FS_RTN_INVALID_FORMAT = 5045;
var FS_RTN_INVALID_PKCS12 = 5046;

var FS_RTN_OBJ_NOT_FOUND = 5050;
var FS_RTN_PKCS7_NO_CONTENT = 5051;
var FS_RTN_PKCS7_NO_CERTIFICATE = 5052;
var FS_RTN_PKCS7_NO_SIGNERINFO = 5053;

var FS_RTN_UNMATCH_CERT_KEY = 5060;

var FS_RTN_SIGN_ERROR = 5061;
var FS_RTN_VERIFY_ERROR = 5062;
var FS_RTN_ENCRYPT_ERROR = 5063;
var FS_RTN_DECRYPT_ERROR = 5064;
var FS_RTN_GENKEY_ERROR = 5065;

var FS_RTN_OPERATION_CANCELED = 5070;
var FS_RTN_PASSWD_INVALID = 5071;

var FS_RTN_PKCS12_NO_AUTHSAFES = 5091;
var FS_RTN_PKCS12_DECODE_BAG_ERROR = 5092;
var FS_RTN_PKCS12_DECRYPT_ERROR = 5093;
var FS_RTN_PKCS12_GETKEY_ERROR = 5094;
var FS_RTN_PKCS12_GETCERT_ERROR = 5095;

var FS_RTN_INVALID_STATE = 5100;
var FS_RTN_OUT_OF_RANGE = 5101;

//CAPI
var FS_RTN_ERROR = 5001;
var FS_RTN_MEMALLOC_ERROR = 5002;
var FS_RTN_BUFFER_TOO_SMALL = 5003;
var FS_RTN_FUNCTION_UNSUPPORT = 5004;
var FS_RTN_INVALID_PARAM = 5005;
var FS_RTN_INVALID_HANDLE = 5006;
var FS_RTN_LIB_EXPIRE = 5007;
var FS_RTN_BASE64_ERROR = 5008;

var FS_RTN_CERT_NOT_FOUND = 5010;
var FS_RTN_CERT_EXPIRED = 5011;
var FS_RTN_CERT_NOT_YET_VALID = 5012;
var FS_RTN_CERT_EXPIRE_OR_NOT_YET_USE = 5013;
var FS_RTN_CERT_DENIED = 5014;
var FS_RTN_CERT_NOISSUER = 5015;
var FS_RTN_CERT_BAD_SIGNATURE = 5016;
var FS_RTN_CERT_INVALID_KEYUSAGE = 5017;

var FS_RTN_CERT_REVOKED = 5020;
var FS_RTN_CERT_UNSPECIFIED = 5020;
var FS_RTN_CERT_KEY_COMPROMISED = 5021;
var FS_RTN_CERT_CA_COMPROMISED = 5022;
var FS_RTN_CERT_AFFILIATION_CHANGED = 5023;
var FS_RTN_CERT_SUPERSEDED = 5024;
var FS_RTN_CERT_CESSATION = 5025;
var FS_RTN_CERT_HOLD = 5026;
var FS_RTN_CERT_REMOVEFROMCRL = 5028;

var FS_RTN_CRL_EXPIRED = 5030;
var FS_RTN_CRL_NOT_YET_VALID = 5031;
var FS_RTN_CRL_NOT_FOUND = 5032;
var FS_RTN_CRL_BAD_SIGNATURE = 5034;

var FS_RTN_GET_DIGEST_ERROR = 5035;
var FS_RTN_BAD_SIGNATURE = 5036;
var FS_RTN_BAD_CONTENT = 5037;

var FS_RTN_INVALID_CERT = 5040;
var FS_RTN_INVALID_CRL = 5041;
var FS_RTN_INVALID_PKCS7 = 5042;
var FS_RTN_INVALID_KEY = 5043;
var FS_RTN_INVALID_CERTREQ = 5044;
var FS_RTN_INVALID_FORMAT = 5045;
var FS_RTN_INVALID_PKCS12 = 5046;

var FS_RTN_OBJ_NOT_FOUND = 5050;
var FS_RTN_PKCS7_NO_CONTENT = 5051;
var FS_RTN_PKCS7_NO_CERTIFICATE = 5052;
var FS_RTN_PKCS7_NO_SIGNERINFO = 5053;

var FS_RTN_UNMATCH_CERT_KEY = 5060;

var FS_RTN_SIGN_ERROR = 5061;
var FS_RTN_VERIFY_ERROR = 5062;
var FS_RTN_ENCRYPT_ERROR = 5063;
var FS_RTN_DECRYPT_ERROR = 5064;
var FS_RTN_GENKEY_ERROR = 5065;
var FS_RTN_DELETE_USR_CERT_ERROR = 5066;
var FS_RTN_UNICODE_ERROR = 5901;

var FS_RTN_OPERATION_CANCELED = 5070;
var FS_RTN_PASSWD_INVALID = 5071;
var FS_RTN_SCARD_BLOCKED = 5072;

var FS_RTN_XMLPARSE_ERROR = 5080;
var FS_RTN_XMLTAG_NOTFOUND = 5081;

var FS_RTN_FILE_NOT_FOUND = 5902;
var FS_RTN_PATH_NOT_FOUND = 5903;
var FS_RTN_BAD_NETPATH = 5904;
var FS_RTN_LOGON_FAILURE = 5905;
var FS_RTN_ACCESS_DENIED = 5906;

//SCARD
var FS_RTN_SCARD_ESTABLISH_CONTEXT_ERROR = 10;
var FS_RTN_SCARD_LIST_READERS_ERROR = 11;
var FS_RTN_SCARD_GET_STATUS_ERROR = 12;
var FS_RTN_SCARD_INVALID_STATUS = 13;
var FS_RTN_SCARD_CARD_ABSENT = 14;
var FS_RTN_SCARD_WCHAR2CHAR_ERROR = 15;
var FS_RTN_SCARD_CHAR2WCHAR_ERROR = 16;
var FS_RTN_SCARD_REMOVED_CARD_ERROR = 17;
var FS_RTN_SCARD_RESET_CARD_ERROR = 18;
var FS_RTN_SCARD_NOT_TRANSACTED_ERROR = 19;
var FS_RTN_SCARD_NOT_TRANSMIT_FAILED = 20;
var FS_RTN_SCARD_ISO7816_ERROR = 21;
var FS_RTN_SCARD_FILE_NOT_FOUND = 22;

var FS_RTN_FISC_PIN_ERROR = 30;
var FS_RTN_FISC_PIN_LOCK = 31;
var FS_RTN_FISC_PIN_WRONGLENGTH = 32;
var FS_RTN_FISC_PIN_WRONGFORMAT = 33;

function errorMsg(errno) {
    return errorMsgAll(errno, 1);
}

function errorMsgAll(errno, flag) {
    switch (errno) {
        case 0:
            return "";

            /* 
             * FSHCA return code
             */
        case HCA_E_UNSUPPORT_FUNC:
            errMsg = (flag > 0) ? "該函式尚未支援" : "This function is not yet supported";
            return errMsg;
        case FSCARD_RTN_CONNECT_FAIL:
            errMsg = (flag > 0) ? "連結卡片失敗" : "Link card failure.";
            return errMsg;
        case FSCARD_RTN_SELECT_APPLET_FAIL:
            errMsg = (flag > 0) ? "非指定之卡片" : "Non-designated card.";
            return errMsg;
        case HCA_E_FAIL_TO_TS_Query:
            errMsg = (flag > 0) ? "TimeStamp Query 失敗" : "TimeStamp Query fail.";
            return errMsg;
        case FSCARD_RTN_ESTABLISH_CONTEXT_FAIL:
            errMsg = (flag > 0) ? "讀取醫事人員憑證卡失敗" : "To establish a connection failure.";
            return errMsg;
        case HCA_E_FAIL_TO_VERIFY_PIN:
            errMsg = (flag > 0) ? "驗卡片PINCode失敗，PINCode輸入錯誤達3次即鎖卡" : "Card PIN Code incorrect.";
            return errMsg;
        case HCA_E_FAIL_TO_PIN_INCORRECT:
            errMsg = (flag > 0) ? "驗卡片PIN碼失敗" : "Card PIN Code incorrect.";
            return errMsg;
        case HCA_E_FAIL_TO_PIN_LOCK:
            errMsg = (flag > 0) ? "卡片鎖卡" : "PIN code be locked, user needs to contact the HCA card centre and ask for help";
            return errMsg;
        case HCA_E_FAIL_TO_TS_Verify:
            errMsg = (flag > 0) ? "TimeStamp Verify 失敗" : "TimeStamp Verify fail.";
            return errMsg;
        case HCA_E_FAIL_TO_GetCertAttrib:
            errMsg = (flag > 0) ? "取憑證屬性失敗" : "Get Cert Attribute fail.";
            return errMsg;
        case HCA_E_FAIL_TO_GetTSInfo:
            errMsg = (flag > 0) ? "取TimeStamp Info失敗" : "Get TimeStamp Info fail.";
            return errMsg;
        case HCA_E_FAIL_TO_CertValidate:
            errMsg = (flag > 0) ? "憑證驗證失敗" : "Verify Cert fail.";
            return errMsg;
        case HCA_E_FAIL_TO_CheckCard:
            errMsg = (flag > 0) ? "與卡片連線失敗，請確實插入卡片" : "Check Card fail.";
            return errMsg;
        case FSCARD_RTN_CARD_STATUS_ERROR:
            errMsg = (flag > 0) ? "卡片狀態不正確" : "Card status is incorrect.";
            return errMsg;
        case FSCARD_RTN_CARD_ABSENT:
            errMsg = (flag > 0) ? "卡片不存在" : "Card does not exist.";
            return errMsg;
        case FSCARD_RTN_TRANSMIT_ERROR:
            errMsg = (flag > 0) ? "資料轉譯錯誤" : "Data translation error.";
            return errMsg;
        case FSCARD_RTN_GET_DATA_ERROR:
            errMsg = (flag > 0) ? "無法取得資料" : "Unable to obtain data.";
            return errMsg;
        case FSCARD_RTN_LOGIN_FAIL:
            errMsg = (flag > 0) ? "卡片無法登入" : "Login fail.";
            return errMsg;
        case FSCARD_RTN_READERS_BUFFER_FAIL:
            errMsg = (flag > 0) ? "讀卡機空間不足" : "Reader insufficient space.";
            return errMsg;
        case FSCARD_RTN_GET_READERS_FAIL:
            errMsg = (flag > 0) ? "無法取得讀卡機" : "Unable to obtain card reader.";
            return errMsg;
        case FSCARD_RTN_NO_READER:
            errMsg = (flag > 0) ? "未接上任何讀卡機" : "It is not connected to any reader.";
            return errMsg;
        case FSCARD_RTN_MEMALLOC_ERROR:
            errMsg = (flag > 0) ? "記憶體配置錯誤" : "Memory allocation error.";
            return errMsg;
        case FSCARD_RTN_LIST_READERS_ERROR:
            errMsg = (flag > 0) ? "列舉讀卡機失敗" : "Reader list failed.";
            return errMsg;
        case FSCARD_RTN_CHAR2WCHAR_ERROR:
            errMsg = (flag > 0) ? "寫出字元失敗" : "Failed to write characters.";
            return errMsg;
        case FSCARD_RTN_WCHAR2CHAR_ERROR:
            errMsg = (flag > 0) ? "讀入字元失敗" : "Read the characters fail.";
            return errMsg;
        case FSCARD_RTN_INVALID_PARAM:
            errMsg = (flag > 0) ? "不合法的參數" : "Invalid parameter.";
            return errMsg;
        case FSCARD_RTN_LIB_EXPIRE:
            errMsg = (flag > 0) ? "函式庫已過期" : "Library has expired.";
            return errMsg;
        case FSCARD_RTN_GEN_PKCS7_FAIL:
            errMsg = (flag > 0) ? "卡片憑證格式錯誤" : "Invalid certificate format.";
            return errMsg;
        case FSCARD_RTN_DATA_HASH_ERROR:
            errMsg = (flag > 0) ? "雜湊失敗" : "Hash fail.";
            return errMsg;
        case FSCARD_RTN_PIN_LENGTH_ERROR:
            errMsg = (flag > 0) ? "卡片PINCode長度不對(6~8碼)" : "Invalid PIN code length, Less or over 6 to 8 digits";
            return errMsg;
        case FSCARD_RTN_PIN_LOCK:
            errMsg = (flag > 0) ? "卡片PINCode鎖住(已錯誤3次)" : "PIN code be locked, user needs to contact the HCA card centre and ask for help";
            return errMsg;
        case FSCARD_RTN_USER_ALREADY_LOGGED_IN:
            errMsg = (flag > 0) ? "使用者已登入卡片, 或卡片的登入狀態未被清除" : "user already login, or login status of card not be reset yet";
            return errMsg;
        case FSCARD_RTN_UNKNOWN_ERROR:
            errMsg = (flag > 0) ? "一般錯誤" : "Unknown error.";
            return errMsg;

            /*
             * FSCrypt/FSCAPI common return
             */
        case FS_RTN_ERROR:
            errMsg = (flag > 0) ? "一般性錯誤" : "general error";
            return errMsg;
        case FS_RTN_MEMALLOC_ERROR:
            errMsg = (flag > 0) ? "配置記憶體發生錯誤" : "Memory Allocation Error";
            return errMsg;
        case FS_RTN_BUFFER_TOO_SMALL:
            errMsg = (flag > 0) ? "記憶體緩衝區太小" : "Buffer too small";
            return FS_ERRMSG_TITLECODE + errno + FS_ERRMSG_TITLEMSG + errMsg + "\n" + FS_ERRMSG_TITLESUGGEST + FS_ERRMSG_REBOOT;
        case FS_RTN_FUNCTION_UNSUPPORT:
            errMsg = (flag > 0) ? "未支援函式" : "function not support";
            return errMsg;
        case FS_RTN_INVALID_PARAM:
            errMsg = (flag > 0) ? "錯誤的參數" : "Invalid parameter";
            return FS_ERRMSG_TITLECODE + errno + FS_ERRMSG_TITLEMSG + errMsg + "\n" + FS_ERRMSG_TITLESUGGEST + FS_ERRMSG_REBOOT;
        case FS_RTN_INVALID_HANDLE:
            errMsg = (flag > 0) ? "無效的handle" : "Invalid handle";
            return errMsg;
        case FS_RTN_LIB_EXPIRE:
            errMsg = (flag > 0) ? "試用版函式庫已過期" : "Trial Version Library is expired";
            return errMsg;
        case FS_RTN_BASE64_ERROR:
            errMsg = (flag > 0) ? "Base64編碼解碼錯誤" : "Base64 Encoding/Decoding Error";
            return errMsg;
        case FS_RTN_CERT_NOT_FOUND:
            errMsg = (flag > 0) ? "找不到可使用之憑證" : "certificate not found in MS CryptoAPI Database";
            return errMsg;
        case FS_RTN_CERT_EXPIRED:
            errMsg = (flag > 0) ? "憑證已過期" : "Certicate Expired";
            return errMsg;
        case FS_RTN_CERT_NOT_YET_VALID:
            errMsg = (flag > 0) ? "憑證時間尚未合法" : "Certificate can not be used now";
            return errMsg;
        case FS_RTN_CERT_EXPIRE_OR_NOT_YET_USE:
            errMsg = (flag > 0) ? "憑證可能過期或無法使用" : "Some certificates are expired, some can not be used now";
            return errMsg;
        case FS_RTN_CERT_DENIED:
            errMsg = (flag > 0) ? "憑證主旨錯誤" : "Certificate subject not match";
            return errMsg;
        case FS_RTN_CERT_NOISSUER:
            errMsg = (flag > 0) ? "無法找到憑證發行者" : "Unable to find certificate issuer";
            return errMsg;
        case FS_RTN_CERT_BAD_SIGNATURE:
            errMsg = (flag > 0) ? "憑證上的簽章值是錯誤的" : "Certificate signature is invalid";
            return errMsg;
        case FS_RTN_CERT_INVALID_KEYUSAGE:
            errMsg = (flag > 0) ? "無效的憑證用途（加解密、簽驗章）" : "Invalid ertificate keyusage";
            return errMsg;
        case FS_RTN_CERT_REVOKED:
            errMsg = (flag > 0) ? "憑證已撤銷" : "Certificate is revoked";
            return errMsg;
        case FS_RTN_CERT_KEY_COMPROMISED:
            errMsg = (flag > 0) ? "憑證已撤銷（金鑰洩露）" : "Certificate is revoked(key compromised)";
            return errMsg;
        case FS_RTN_CERT_CA_COMPROMISED:
            errMsg = (flag > 0) ? "憑證已撤銷（CA compromised）" : "Certificate is revoked(CA compromised)";
            return errMsg;
        case FS_RTN_CERT_AFFILIATION_CHANGED:
            errMsg = (flag > 0) ? "憑證已撤銷（聯盟已變更）" : "Certificate is revoked(affiliation changed)";
            return errMsg;
        case FS_RTN_CERT_SUPERSEDED:
            errMsg = (flag > 0) ? "憑證已撤銷（已取代）" : "Certificate is revoked(superseded)";
            return errMsg;
        case FS_RTN_CERT_CESSATION:
            errMsg = (flag > 0) ? "憑證已撤銷（已停止）" : "Certificate is revoked(cessation)";
            return errMsg;
        case FS_RTN_CERT_HOLD:
            errMsg = (flag > 0) ? "憑證保留或暫禁" : "Certificate is revoked(hold)";
            return errMsg;
        case FS_RTN_CERT_REMOVEFROMCRL:
            errMsg = (flag > 0) ? "憑證己撤銷（凍結）" : "Certificate is revoked(hold)";
            return errMsg;
        case FS_RTN_CRL_EXPIRED:
            errMsg = (flag > 0) ? "CRL 已過期" : "CRL expired";
            return errMsg;
        case FS_RTN_CRL_NOT_YET_VALID:
            errMsg = (flag > 0) ? "CRL 尚未有效" : "CRL not yet valid";
            return errMsg;
        case FS_RTN_CRL_NOT_FOUND:
            errMsg = (flag > 0) ? "無法找到CRL" : "CRL not found";
            return errMsg;
        case FS_RTN_CRL_BAD_SIGNATURE:
            errMsg = (flag > 0) ? "CRL上的簽章值無效" : "CRL signature invalid";
            return errMsg;
        case FS_RTN_GET_DIGEST_ERROR:
            errMsg = (flag > 0) ? "取得摘要值錯誤" : "Get Digest error";
            return errMsg;
        case FS_RTN_BAD_SIGNATURE:
            errMsg = (flag > 0) ? "不合法的簽章" : "Invalid data signature";
            return errMsg;
        case FS_RTN_BAD_CONTENT:
            errMsg = (flag > 0) ? "內容錯誤" : "Content not match";
            return errMsg;
        case FS_RTN_INVALID_CERT:
            errMsg = (flag > 0) ? "憑證格式錯誤" : "Incorrect Certificate format";
            return errMsg;
        case FS_RTN_INVALID_CRL:
            errMsg = (flag > 0) ? "CRL 格式錯誤" : "Incorrect CRL format";
            return errMsg;
        case FS_RTN_INVALID_PKCS7:
            errMsg = (flag > 0) ? "錯誤的PKCS7格式" : "Incorrect PKCS7 format";
            return errMsg;
        case FS_RTN_INVALID_KEY:
            errMsg = (flag > 0) ? "金鑰的格式錯誤" : "Incorrect KEY format";
            return errMsg;
        case FS_RTN_INVALID_CERTREQ:
            errMsg = (flag > 0) ? "不合法的憑證請求檔格式(PKCS10)" : "Incorrect PKCS10 format";
            return errMsg;
        case FS_RTN_INVALID_FORMAT:
            errMsg = (flag > 0) ? "無效的格式" : "Incorrect format";
            return errMsg;
        case FS_RTN_INVALID_PKCS12:
            errMsg = (flag > 0) ? "無效的PKCS12格式" : "Invalid PKCS12";
            return errMsg;
        case FS_RTN_OBJ_NOT_FOUND:
            errMsg = (flag > 0) ? "找不到指定物件" : "Object No found";
            return errMsg;
        case FS_RTN_PKCS7_NO_CONTENT:
            errMsg = (flag > 0) ? "簽章值中無原文" : "No content in PkCS7 Signature";
            return errMsg;
        case FS_RTN_PKCS7_NO_CERTIFICATE:
            errMsg = (flag > 0) ? "簽章值中無憑證" : "No certificate in PkCS7 Signature";
            return errMsg;
        case FS_RTN_PKCS7_NO_SIGNERINFO:
            errMsg = (flag > 0) ? "簽章值中無SignerInfo" : "No SignerInfo in PkCS7 Signature";
            return errMsg;
        case FS_RTN_UNMATCH_CERT_KEY:
            errMsg = (flag > 0) ? "憑證與私密金鑰並非成對" : "Certificate/PrivateKey not match";
            return errMsg;
        case FS_RTN_SIGN_ERROR:
            errMsg = (flag > 0) ? "簽章失敗" : "Sign error";
            return errMsg;
        case FS_RTN_VERIFY_ERROR:
            errMsg = (flag > 0) ? "驗章失敗" : "Verify error";
            return errMsg;
        case FS_RTN_ENCRYPT_ERROR:
            errMsg = (flag > 0) ? "加密失敗" : "Encrypt error";
            return errMsg;
        case FS_RTN_DECRYPT_ERROR:
            errMsg = (flag > 0) ? "解密失敗" : "Decrypt error";
            return errMsg;
        case FS_RTN_GENKEY_ERROR:
            errMsg = (flag > 0) ? "產生金鑰失敗" : "Generate key error";
            return errMsg;
        case FS_RTN_OPERATION_CANCELED:
            errMsg = (flag > 0) ? "取消操作" : "Operation Cancel";
            return errMsg;
        case FS_RTN_PASSWD_INVALID:
            errMsg = (flag > 0) ? "密碼不正確" : "Invalid Password";
            return errMsg;
        case FS_RTN_PKCS12_NO_AUTHSAFES:
            errMsg = (flag > 0) ? "PKCS12不正確" : "Invalid PCKS12";
            return errMsg;
        case FS_RTN_PKCS12_DECODE_BAG_ERROR:
            errMsg = (flag > 0) ? "PKCS12解碼失敗" : "Decode PCKS12 Error";
            return errMsg;
        case FS_RTN_PKCS12_DECRYPT_ERROR:
            errMsg = (flag > 0) ? "PKCS12解密失敗" : "Derypt PCKS12 Error";
            return errMsg;
        case FS_RTN_PKCS12_GETKEY_ERROR:
            errMsg = (flag > 0) ? "PKCS12取得金鑰失敗" : "PCKS12 Get Key Error";
            return errMsg;
        case FS_RTN_PKCS12_GETCERT_ERROR:
            errMsg = (flag > 0) ? "PKCS12取得憑證失敗" : "PCKS12 Get Cert Error";
            return errMsg;
        case FS_RTN_INVALID_STATE:
            errMsg = (flag > 0) ? "無效狀態" : "Invalid State";
            return errMsg;
        case FS_RTN_OUT_OF_RANGE:
            errMsg = (flag > 0) ? "超出範圍" : "Out of range";
            return errMsg;

            /*
             * FSP11 Only
             */
        case FSP11_RTN_CANCEL:
            errMsg = (flag > 0) ? "PKCS#11 取消操作" : "PKCS#11 FSP11_RTN_CANCEL";
            return errMsg;
        case FSP11_RTN_HOST_MEMORY:
            errMsg = (flag > 0) ? "PKCS#11 記憶體不足" : "PKCS#11 Insufficient memory";
            return errMsg;
        case FSP11_RTN_SLOT_ID_INVALID:
            errMsg = (flag > 0) ? "PKCS#11 指定的Slot是無效的" : "PKCS#11 Specified slot ID is not valid";
            return errMsg;
        case FSP11_RTN_GENERAL_ERROR:
            errMsg = (flag > 0) ? "PKCS#11 一般性錯誤" : "PKCS#11 GENERAL_ERROR maybe unrecoverable error has occurred";
            return errMsg;
        case FSP11_RTN_FUNCTION_FAILED:
            errMsg = (flag > 0) ? "PKCS#11 要求的函式無法執行" : "PKCS#11 Requested function could not be performed";
            return errMsg;
        case FSP11_RTN_ARGUMENTS_BAD:
            errMsg = (flag > 0) ? "PKCS#11 錯誤的參數" : "PKCS#11 Invalid arguments";
            return errMsg;
        case FSP11_RTN_NO_EVENT:
            errMsg = (flag > 0) ? "無事件" : "PKCS#11 FSP11_RTN_NO_EVENT";
            return errMsg;
        case FSP11_RTN_NEED_TO_CREATE_THREADS:
            errMsg = (flag > 0) ? "需要建立Threads" : "PKCS#11 FSP11_RTN_NEED_TO_CREATE_THREADS";
            return errMsg;
        case FSP11_RTN_CANT_LOCK:
            errMsg = (flag > 0) ? "無法Lock" : "PKCS#11 FSP11_RTN_CANT_LOCK";
            return errMsg;
        case FSP11_RTN_ATTRIBUTE_READ_ONLY:
            errMsg = (flag > 0) ? "唯讀屬性" : "PKCS#11 FSP11_RTN_ATTRIBUTE_READ_ONLY";
            return errMsg;
        case FSP11_RTN_ATTRIBUTE_SENSITIVE:
            errMsg = (flag > 0) ? "機密屬性" : "PKCS#11 FSP11_RTN_ATTRIBUTE_SENSITIVE";
            return errMsg;
        case FSP11_RTN_ATTRIBUTE_TYPE_INVALID:
            errMsg = (flag > 0) ? "屬性型態不正確" : "PKCS#11 FSP11_RTN_ATTRIBUTE_TYPE_INVALID";
            return errMsg;
        case FSP11_RTN_ATTRIBUTE_VALUE_INVALID:
            errMsg = (flag > 0) ? "屬性值不正確" : "PKCS#11 FSP11_RTN_ATTRIBUTE_VALUE_INVALID";
            return errMsg;
        case FSP11_RTN_DATA_INVALID:
            errMsg = (flag > 0) ? "資料不正確" : "PKCS#11 FSP11_RTN_DATA_INVALID";
            return errMsg;
        case FSP11_RTN_DATA_LEN_RANGE:
            errMsg = (flag > 0) ? "資料長度不正確" : "PKCS#11 FSP11_RTN_DATA_LEN_RANGE";
            return errMsg;
        case FSP11_RTN_DEVICE_ERROR:
            errMsg = (flag > 0) ? "讀卡機裝置不正確" : "FSP11_RTN_DEVICE_ERROR";
            return errMsg;
        case FSP11_RTN_DEVICE_MEMORY:
            errMsg = (flag > 0) ? "讀卡機裝置的記憶體不足" : "PKCS#11 token does not have sufficient memory";
            return errMsg;
        case FSP11_RTN_DEVICE_REMOVED:
            errMsg = (flag > 0) ? "讀卡機裝置已移除" : "FSP11_RTN_DEVICE_REMOVED";
            return errMsg;
        case FSP11_RTN_ENCRYPTED_DATA_INVALID:
            errMsg = (flag > 0) ? "加密資料不正確" : "FSP11_RTN_ENCRYPTED_DATA_INVALID";
            return errMsg;
        case FSP11_RTN_ENCRYPTED_DATA_LEN_RANGE:
            errMsg = (flag > 0) ? "被加密資料長度錯誤" : "FSP11_RTN_ENCRYPTED_DATA_LEN_RANGE";
            return errMsg;
        case FSP11_RTN_FUNCTION_CANCELED:
            errMsg = (flag > 0) ? "功能已取消" : "FSP11_RTN_FUNCTION_CANCELED";
            return errMsg;
        case FSP11_RTN_FUNCTION_NOT_PARALLEL:
            errMsg = (flag > 0) ? "功能無法並行" : "FSP11_RTN_FUNCTION_NOT_PARALLEL";
            return errMsg;
        case FSP11_RTN_FUNCTION_NOT_SUPPORTED:
            errMsg = (flag > 0) ? "功能不支援" : "FSP11_RTN_FUNCTION_NOT_SUPPORTED";
            return errMsg;
        case FSP11_RTN_KEY_HANDLE_INVALID:
            errMsg = (flag > 0) ? "金鑰Handle不正確" : "FSP11_RTN_KEY_HANDLE_INVALID";
            return errMsg;
        case FSP11_RTN_KEY_SIZE_RANGE:
            errMsg = (flag > 0) ? "金鑰長度不正確" : "FSP11_RTN_KEY_SIZE_RANGE";
            return errMsg;
        case FSP11_RTN_KEY_TYPE_INCONSISTENT:
            errMsg = (flag > 0) ? "金鑰種類不一致" : "FSP11_RTN_KEY_TYPE_INCONSISTENT";
            return errMsg;
        case FSP11_RTN_KEY_NOT_NEEDED:
            errMsg = (flag > 0) ? "金鑰已不需要" : "FSP11_RTN_KEY_NOT_NEEDED";
            return errMsg;
        case FSP11_RTN_KEY_CHANGED:
            errMsg = (flag > 0) ? "金鑰已變更" : "FSP11_RTN_KEY_CHANGED";
            return errMsg;
        case FSP11_RTN_KEY_NEEDED:
            errMsg = (flag > 0) ? "需要金鑰" : "FSP11_RTN_KEY_NEEDED";
            return errMsg;
        case FSP11_RTN_KEY_INDIGESTIBLE:
            errMsg = (flag > 0) ? "需要金鑰" : "FSP11_RTN_KEY_INDIGESTIBLE";
            return errMsg;
        case FSP11_RTN_KEY_FUNCTION_NOT_PERMITTED:
            errMsg = (flag > 0) ? "無法接受的金鑰" : "FSP11_RTN_KEY_FUNCTION_NOT_PERMITTED";
            return errMsg;
        case FSP11_RTN_KEY_NOT_WRAPPABLE:
            errMsg = (flag > 0) ? "金鑰無法包裹" : "FSP11_RTN_KEY_NOT_WRAPPABLE";
            return errMsg;
        case FSP11_RTN_KEY_UNEXTRACTABLE:
            errMsg = (flag > 0) ? "金鑰無法匯出" : "FSP11_RTN_KEY_UNEXTRACTABLE";
            return errMsg;
        case FSP11_RTN_MECHANISM_INVALID:
            errMsg = (flag > 0) ? "指定的機制不存在" : "FSP11_RTN_MECHANISM_INVALID";
            return errMsg;
        case FSP11_RTN_MECHANISM_PARAM_INVALID:
            errMsg = (flag > 0) ? "指定的機制不存在" : "FSP11_RTN_MECHANISM_PARAM_INVALID";
            return errMsg;
        case FSP11_RTN_OBJECT_HANDLE_INVALID:
            errMsg = (flag > 0) ? "PKCS#11 物件的 Handle 不正確" : "PKCS#11 specified object handle is not valid";
            return errMsg;
        case FSP11_RTN_OPERATION_ACTIVE:
            errMsg = (flag > 0) ? "操作運作中" : "FSP11_RTN_OPERATION_ACTIVE";
            return errMsg;
        case FSP11_RTN_OPERATION_NOT_INITIALIZED:
            errMsg = (flag > 0) ? "操作未初始化" : "FSP11_RTN_OPERATION_NOT_INITIALIZED";
            return errMsg;
        case FSP11_RTN_PIN_INCORRECT:
            errMsg = (flag > 0) ? "卡片密碼不正確\n" : "PKCS#11 specified PIN is incorrect\n";
            return errMsg;
        case FSP11_RTN_PIN_INVALID:
            errMsg = (flag > 0) ? "卡片密碼中有不合法的字元" : "PKCS#11 specified PIN has invalid characters";
            return errMsg;
        case FSP11_RTN_PIN_LEN_RANGE:
            errMsg = (flag > 0) ? "卡片密碼長度不正確" : "PKCS#11 specified PIN is too long or too short";
            return errMsg;
        case FSP11_RTN_PIN_EXPIRED:
            errMsg = (flag > 0) ? "卡片密碼已經過期" : "PKCS#11 specified PIN has expired";
            return errMsg;
        case FSP11_RTN_PIN_LOCKED:
            errMsg = (flag > 0) ? "卡片密碼已經鎖住" : "PKCS#11 PIN is locked";
            return errMsg;
        case FSP11_RTN_SESSION_CLOSED:
            errMsg = (flag > 0) ? "與讀卡機裝置的連線結束" : "FSP11_RTN_SESSION_CLOSED";
            return errMsg;
        case FSP11_RTN_SESSION_COUNT:
            errMsg = (flag > 0) ? "與讀卡機裝置的連線結束" : "FSP11_RTN_SESSION_COUNT";
            return errMsg;
        case FSP11_RTN_SESSION_HANDLE_INVALID:
            errMsg = (flag > 0) ? "指定的連線不存在" : "FSP11_RTN_SESSION_HANDLE_INVALID";
            return errMsg;
        case FSP11_RTN_SESSION_PARALLEL_NOT_SUPPORTED:
            errMsg = (flag > 0) ? "Session不支援並行" : "FSP11_RTN_SESSION_PARALLEL_NOT_SUPPORTED";
            return errMsg;
        case FSP11_RTN_SESSION_READ_ONLY:
            errMsg = (flag > 0) ? "Session為唯讀" : "FSP11_RTN_SESSION_READ_ONLY";
            return errMsg;
        case FSP11_RTN_SESSION_EXISTS:
            errMsg = (flag > 0) ? "指定的連線已存在" : "FSP11_RTN_SESSION_EXISTS";
            return errMsg;
        case FSP11_RTN_SESSION_READ_ONLY_EXISTS:
            errMsg = (flag > 0) ? "Session為唯讀已存在" : "FSP11_RTN_SESSION_READ_ONLY_EXISTS";
            return errMsg;
        case FSP11_RTN_SESSION_READ_WRITE_SO_EXISTS:
            errMsg = (flag > 0) ? "Session可讀寫已存在" : "FSP11_RTN_SESSION_READ_WRITE_SO_EXISTS";
            return errMsg;
        case FSP11_RTN_SIGNATURE_INVALID:
            errMsg = (flag > 0) ? "簽章值不合法" : "FSP11_RTN_SIGNATURE_INVALID";
            return errMsg;
        case FSP11_RTN_SIGNATURE_LEN_RANGE:
            errMsg = (flag > 0) ? "簽章值長度不正確" : "FSP11_RTN_SIGNATURE_LEN_RANGE";
            return errMsg;
        case FSP11_RTN_TEMPLATE_INCOMPLETE:
            errMsg = (flag > 0) ? "樣板不完整" : "FSP11_RTN_TEMPLATE_INCOMPLETE";
            return errMsg;
        case FSP11_RTN_TEMPLATE_INCONSISTENT:
            errMsg = (flag > 0) ? "樣板不一致" : "FSP11_RTN_TEMPLATE_INCONSISTENT";
            return errMsg;
        case FSP11_RTN_TOKEN_NOT_PRESENT:
            errMsg = (flag > 0) ? "找不到卡片，您可能尚未將卡片插入讀卡機內" : "PKCS#11 token was not present";
            return errMsg;
        case FSP11_RTN_TOKEN_NOT_RECOGNIZED:
            errMsg = (flag > 0) ? "卡片無法辨識" : "PKCS#11 does not recognize the token in the slot";
            return errMsg;
        case FSP11_RTN_TOKEN_WRITE_PROTECTED:
            errMsg = (flag > 0) ? "卡片有寫入保護" : "FSP11_RTN_TOKEN_WRITE_PROTECTED";
            return errMsg;
        case FSP11_RTN_UNWRAPPING_KEY_HANDLE_INVALID:
            errMsg = (flag > 0) ? "解包裹的金鑰Handle不合法" : "FSP11_RTN_UNWRAPPING_KEY_HANDLE_INVALID";
            return errMsg;
        case FSP11_RTN_UNWRAPPING_KEY_SIZE_RANGE:
            errMsg = (flag > 0) ? "解包裹的金鑰長度不正確" : "FSP11_RTN_UNWRAPPING_KEY_SIZE_RANGE";
            return errMsg;
        case FSP11_RTN_UNWRAPPING_KEY_TYPE_INCONSISTENT:
            errMsg = (flag > 0) ? "解包裹的金鑰種類不一致" : "FSP11_RTN_UNWRAPPING_KEY_TYPE_INCONSISTENT";
            return errMsg;
        case FSP11_RTN_USER_ALREADY_LOGGED_IN:
            errMsg = (flag > 0) ? "PKCS#11 使用者已登入" : "PKCS#11 user is already logged in";
            return errMsg;
        case FSP11_RTN_USER_NOT_LOGGED_IN:
            errMsg = (flag > 0) ? "PKCS#11 使用者未登入" : "PKCS#11 user is not logged in";
            return errMsg;
        case FSP11_RTN_USER_PIN_NOT_INITIALIZED:
            errMsg = (flag > 0) ? "密碼未初始化" : "FSP11_RTN_USER_PIN_NOT_INITIALIZED";
            return errMsg;
        case FSP11_RTN_USER_TYPE_INVALID:
            errMsg = (flag > 0) ? "使用者種類不正確" : "FSP11_RTN_USER_TYPE_INVALID";
            return errMsg;
        case FSP11_RTN_USER_ANOTHER_ALREADY_LOGGED_IN:
            errMsg = (flag > 0) ? "另一個使用者已登入" : "FSP11_RTN_USER_ANOTHER_ALREADY_LOGGED_IN";
            return errMsg;
        case FSP11_RTN_USER_TOO_MANY_TYPES:
            errMsg = (flag > 0) ? "太多使用者種類" : "FSP11_RTN_USER_TOO_MANY_TYPES";
            return errMsg;
        case FSP11_RTN_WRAPPED_KEY_INVALID:
            errMsg = (flag > 0) ? "包裹的金鑰不合法" : "FSP11_RTN_WRAPPED_KEY_INVALID";
            return errMsg;
        case FSP11_RTN_WRAPPED_KEY_LEN_RANGE:
            errMsg = (flag > 0) ? "包裹的金鑰長度不正確" : "FSP11_RTN_WRAPPED_KEY_LEN_RANGE";
            return errMsg;
        case FSP11_RTN_WRAPPING_KEY_HANDLE_INVALID:
            errMsg = (flag > 0) ? "包裹的金鑰Handle不合法" : "FSP11_RTN_WRAPPING_KEY_HANDLE_INVALID";
            return errMsg;
        case FSP11_RTN_WRAPPING_KEY_SIZE_RANGE:
            errMsg = (flag > 0) ? "包裹中的金鑰長度不正確" : "FSP11_RTN_WRAPPING_KEY_SIZE_RANGE";
            return errMsg;
        case FSP11_RTN_WRAPPING_KEY_TYPE_INCONSISTENT:
            errMsg = (flag > 0) ? "包裹中的金鑰種類不一致" : "FSP11_RTN_WRAPPING_KEY_TYPE_INCONSISTENT";
            return errMsg;
        case FSP11_RTN_RANDOM_SEED_NOT_SUPPORTED:
            errMsg = (flag > 0) ? "不支援Random Seed" : "FSP11_RTN_RANDOM_SEED_NOT_SUPPORTED";
            return errMsg;
        case FSP11_RTN_RANDOM_NO_RNG:
            errMsg = (flag > 0) ? "不支援Random Seed" : "FSP11_RTN_RANDOM_NO_RNG";
            return errMsg;
        case FSP11_RTN_BUFFER_TOO_SMALL:
            errMsg = (flag > 0) ? "PKCS#11 記憶體緩衝區太小" : "PKCS#11 Buffer too small";
            return errMsg;
        case FSP11_RTN_SAVED_STATE_INVALID:
            errMsg = (flag > 0) ? "儲存狀態失敗" : "FSP11_RTN_SAVED_STATE_INVALID";
            return errMsg;
        case FSP11_RTN_INFORMATION_SENSITIVE:
            errMsg = (flag > 0) ? "資訊為機密" : "FSP11_RTN_INFORMATION_SENSITIVE";
            return errMsg;
        case FSP11_RTN_STATE_UNSAVEABLE:
            errMsg = (flag > 0) ? "資訊為機密" : "FSP11_RTN_STATE_UNSAVEABLE";
            return errMsg;
        case FSP11_RTN_CRYPTOKI_NOT_INITIALIZED:
            errMsg = (flag > 0) ? "PKCS#11 Cryptoki 函式庫尚未初始化過" : "PKCS#11 Cryptoki library has not yet been initialized";
            return errMsg;
        case FSP11_RTN_CRYPTOKI_ALREADY_INITIALIZED:
            errMsg = (flag > 0) ? "PKCS#11 Cryptoki 函式庫已經初始化過" : "PKCS#11 Cryptoki library has already been initialized";
            return errMsg;
        case FSP11_RTN_MUTEX_BAD:
            errMsg = (flag > 0) ? "MUTEX壞了" : "FSP11_RTN_MUTEX_BAD";
            return errMsg;
        case FSP11_RTN_MUTEX_NOT_LOCKED:
            errMsg = (flag > 0) ? "MUTEX無鎖住" : "FSP11_RTN_MUTEX_NOT_LOCKED";
            return errMsg;
        case FSP11_RTN_VENDOR_DEFINED:
            errMsg = (flag > 0) ? "廠商已定義" : "PKCS#11 CKR_VENDOR_DEFINED";
            return errMsg;
        case FSP11_RTN_OBJECT_NOT_EXIST:
            errMsg = (flag > 0) ? "指定物件不存在" : "PKCS#11 specified object is not existed";
            return errMsg;
        case FSP11_RTN_OBJECT_EXIST:
            errMsg = (flag > 0) ? "PKCS#11 指定物件已存在" : "PKCS#11 specified object is already existed";
            return errMsg;
        case FSP11_RTN_OBJECT_HAS_PROBLEM:
            errMsg = (flag > 0) ? "PKCS#11 相同物件超過一個" : "PKCS#11 more than two objects existed";
            return errMsg;
        case FSP11_RTN_LOAD_LIBRARY_FAIL:
            errMsg = (flag > 0) ? "PKCS#11 載入函式庫失敗" : "PKCS#11 load library fail";
            return errMsg;
        case FSP11_RTN_LIBRARY_NOT_LOAD:
            errMsg = (flag > 0) ? "PKCS#11 載入函式庫失敗" : "FSP11_RTN_LIBRARY_NOT_LOAD";
            return errMsg;
        case FSP11_RTN_SLOT_NOT_FOUND:
            errMsg = (flag > 0) ? "slot 找不到" : "FSP11_RTN_SLOT_NOT_FOUND";
            return errMsg;


            /*return errMsg;
             *  FSSCUtils
             */
            return errMsg;
            errMsg = (flag > 0) ? "卡片上的指定檔案不存在" : "Specific FILE on Smart Card is absent";
            return errMsg;
        case FS_RTN_SCARD_CARD_ABSENT:
            errMsg = (flag > 0) ? "卡片不存在" : "Smart Card is absent";
            return errMsg;
        case FS_RTN_FISC_PIN_ERROR:
            errMsg = (flag > 0) ? "晶片金融卡密碼錯誤" : "FISCII PIN Error";
            return errMsg;
        case FS_RTN_FISC_PIN_LOCK:
            errMsg = (flag > 0) ? "晶片金融卡密碼鎖卡" : "FISCII PIN Locked";
            return errMsg;
        case FS_RTN_FISC_PIN_WRONGLENGTH:
            errMsg = (flag > 0) ? "晶片金融卡密碼長度不正確" : "FISCII PIN length is invalid";
            return errMsg;
        case FS_RTN_FISC_PIN_WRONGFORMAT:
            errMsg = (flag > 0) ? "晶片金融卡密碼格式不正確" : "FISCII PIN format is invalid";
            return errMsg;

        default:
            errMsg = (flag > 0) ? "發生不明錯誤" : "unknow error";
            return errMsg;
    }
    return 0;
}