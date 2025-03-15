import {useState, useRef} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native';
import {Card, Icon} from '@rneui/themed';

type Props = {
  data: {totalSessionHours: number; totalNumberOfAlert: number};
  loading: boolean;
};

export const SummaryCard = ({data, loading}: Props) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({top: 0, left: 0});
  const iconRef = useRef<View>(null);
  const totalSessionHours = data?.totalSessionHours ?? 'N/A';
  const totalNumberOfAlert = data?.totalNumberOfAlert ?? 'N/A';

  const toggleTooltip = () => {
    if (tooltipVisible) {
      setTooltipVisible(false);
    } else {
      iconRef.current?.measure((fx, fy, width, height, px, py) => {
        setTooltipPosition({top: py - 85, left: px - 77});
        setTooltipVisible(true);
      });
    }
  };

  return (
    <>
      <Card wrapperStyle={styles.wrapperStyle} containerStyle={styles.containerStyle}>
        <Card.Title style={styles.cardTitle}>Driving Time Overview</Card.Title>
        <View style={styles.contentContainer}>
          <View style={styles.content}>
            <View style={styles.loading}>
              {loading ? (
                <ActivityIndicator size="large" color="#ffffff" />
              ) : (
                <Text style={styles.contentTitle}>{totalSessionHours}</Text>
              )}
            </View>
            <View style={styles.innerContent}>
              <Text style={styles.contentText}>hours with detection</Text>
              <TouchableOpacity onPress={toggleTooltip}>
                <View ref={iconRef}>
                  <Icon
                    name={tooltipVisible ? 'help' : 'help-outline'}
                    color="#00FFFF"
                    size={15}
                    style={{paddingLeft: 5}}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.content}>
            <View style={styles.loading}>
              {loading ? (
                <ActivityIndicator size="large" color="#ffffff" />
              ) : (
                <Text style={styles.contentTitle}>{totalNumberOfAlert}</Text>
              )}
            </View>
            <Text style={styles.contentText}>alerts received</Text>
          </View>
        </View>
      </Card>
      {tooltipVisible && (
        <View style={[styles.tooltipOverlay, tooltipPosition]}>
          <Text style={styles.tooltipText}>
            The time spent driving while Drive Buddy’s drowsiness detection was active.
          </Text>
          <View style={styles.tooltipArrow} />
        </View>
      )}
    </>
  );
};

// Styles will be replaced after the visual design is ready
const styles = StyleSheet.create({
  containerStyle: {
    borderRadius: 36,
    padding: 0,
    margin: 0,
    backgroundColor: '#1E3A8A',
  },
  wrapperStyle: {padding: 25},
  cardTitle: {textAlign: 'left', fontWeight: 'bold', marginBottom: 10, color: 'white'},
  contentContainer: {
    flexDirection: 'row',
    gap: 20,
    borderColor: 'transparent',
    padding: 0,
    margin: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    borderColor: 'transparent',
    boxShadow: 'none',
    padding: 0,
    margin: 0,
  },
  innerContent: {flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'},
  contentTitle: {textAlign: 'left', fontSize: 32, color: 'white'},
  contentText: {textAlign: 'left', color: 'white'},
  loading: {alignItems: 'flex-start', height: 45, justifyContent: 'flex-end', paddingBottom: 1},
  tooltipOverlay: {
    position: 'absolute',
    backgroundColor: '#00FFFF',
    padding: 10,
    borderRadius: 20,
    boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.5)',
    width: 200,
    zIndex: 9999,
    elevation: 10,
  },
  tooltipText: {
    color: 'black',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -20,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 20,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#00FFFF',
  },
});
