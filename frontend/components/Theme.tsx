import {createTheme} from '@rneui/themed';

const theme = createTheme({
  /****************************************/
  /*            COLOR PALETTE             */
  /****************************************/
  lightColors: {
    primary: '#1E3A8A', // Ocean Blue
    secondary: '#EFEFEF', // Silver
    background: '#F5F5F5', // Background from Mockup
    white: '#FFFFFF',
    black: '#000000', // Darkest palette color as "black"
    grey0: '#333333', //Nature4
    grey1: '#666666',
    grey2: '#999999',
    grey3: '#CCCCCC',
    grey4: '#DDDDDD',
    grey5: '#EFEFEF',
    greyOutline: '#C0C0C0', // Border color
    searchBg: '#EFEFEF',
    success: '#00FF5F', // Accent Color (Green)
    error: '#d32f2f',
    warning: '#ed6c02',
    disabled: '#CCCCCC',
    divider: '#CCCCCC',
  },
  darkColors: {
    primary: '#bb86fc',
    secondary: '#03dac6',
    background: '#121212',
  },

  /****************************************/
  /*           COMPONENT STYLES           */
  /****************************************/
  components: {
    /****************************************/
    /*            TYPOGRAPHY                */
    /****************************************/
    Text: {
      style: {
        fontFamily: 'Montserrat, Arial, sans-serif', // Default font
        fontSize: 18, //Base
        color: '#1E3A8A',
      },
      h1Style: {
        fontFamily: 'Urbanist, Arial, sans-serif',
        fontSize: 48,
        fontWeight: '400',
      },
      h2Style: {
        fontFamily: 'Urbanist, Arial, sans-serif',
        fontSize: 40,
        fontWeight: '400',
      },
      h3Style: {
        fontFamily: 'Urbanist, Arial, sans-serif',
        fontSize: 32,
        fontWeight: '400',
      },
      h4Style: {
        fontFamily: 'Urbanist, Arial, sans-serif',
        fontSize: 26,
        fontWeight: '400',
      },
    },

    /****************************************/
    /*          BUTTON COMPONENT         */
    /****************************************/
    Button: {
      buttonStyle: {
        minHeight: 42,
        paddingVertical: 10,
        paddingHorizontal: 20,
        shadowColor: 'transparent',
      },
      containerStyle: {
        marginVertical: 5,
        alignSelf: 'center',
        borderWidth: 2,
        borderRadius: 50,
        borderColor: '#1E3A8A',
      },
      titleStyle: {
        fontSize: 18,
        // fontWeight: 'bold',
        textTransform: 'none',
      },
      disabledStyle: {
        backgroundColor: '#CCCCCC',
      },
      disabledTitleStyle: {
        color: '#666666',
      },
    },

    /****************************************/
    /*          TEXTFIELD COMPONENT         */
    /****************************************/

    Input: {
      containerStyle: {
        marginVertical: 8,
      },
      inputContainerStyle: {
        borderWidth: 1,
        borderColor: '#1E3A8A',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
      },
      inputStyle: {
        fontSize: 16,
        color: '#1E3A8A',
      },
      labelStyle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E3A8A',
      },
    },

    /****************************************/
    /*         TAB COMPONENT                */
    /****************************************/

    Tab: {
      containerStyle: {
        backgroundColor: '#1E3A8A',
        borderRadius: 25,
        paddingVertical: 5,
        marginVertical: 10,
      },
      indicatorStyle: {
        backgroundColor: 'transparent',
      },
      buttonStyle: active => ({
        backgroundColor: active ? '#FFFFFF' : 'transparent',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
      }),
      titleStyle: active => ({
        fontSize: 14,
        fontWeight: 'bold',
        color: active ? '#1E3A8A' : '#FFFFFF',
      }),
    },

    /****************************************/
    /*              CARD                     */
    /****************************************/
    Card: {
      containerStyle: {
        backgroundColor: '#1E3A8A',
        borderRadius: 15,
        padding: 16,
        marginVertical: 10,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      },
    },
    Icon: {
      color: '#1E3A8A',
      size: 40,
    },
  },
});

export default theme;
