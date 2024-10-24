import rawData from '../public/employment-data.json'

class DataProcessor {
  constructor() {
    this.rawData = rawData
    this.processedData = this.processData()
  }

  processData() {
    const { dataset } = this.rawData
    const { Grossregion, Wirtschaftssektor, Geschlecht, Quartal } = dataset.dimension

    const regions = this.processCategory(Grossregion.category)
    const sectors = this.processCategory(Wirtschaftssektor.category)
    const genders = this.processCategory(Geschlecht.category)
    const quarters = this.processCategory(Quartal.category)

    return {
      regions,
      sectors,
      genders,
      quarters,
      employmentData: dataset.value,
      dimensions: {
        regionsCount: Object.keys(Grossregion.category.index).length,
        sectorsCount: Object.keys(Wirtschaftssektor.category.index).length,
        gendersCount: Object.keys(Geschlecht.category.index).length,
        quartersCount: Object.keys(Quartal.category.index).length
      }
    }
  }

  processCategory(category) {
    return Object.entries(category.index).map(([id, index]) => ({
      id,
      label: category.label[id],
      index: parseInt(index)
    })).sort((a, b) => a.index - b.index)
  }

  getIndex(regionId, sectorId, genderId, quarterId) {
    const { Grossregion, Wirtschaftssektor, Geschlecht, Quartal } = this.rawData.dataset.dimension
    const { sectorsCount, gendersCount, quartersCount } = this.processedData.dimensions

    const regionIndex = parseInt(Grossregion.category.index[regionId])
    const sectorIndex = parseInt(Wirtschaftssektor.category.index[sectorId])
    const genderIndex = parseInt(Geschlecht.category.index[genderId])
    const quarterIndex = parseInt(Quartal.category.index[quarterId])

    return (
        regionIndex * sectorsCount * gendersCount * quartersCount +
        sectorIndex * gendersCount * quartersCount +
        genderIndex * quartersCount +
        quarterIndex
    )
  }

  getRegions() {
    return this.processedData.regions
  }

  getSectors() {
    return this.processedData.sectors
  }

  getQuarters() {
    return this.processedData.quarters
  }

  getGenderDistribution(regionId, sectorId, quarterId) {
    const maleIndex = this.getIndex(regionId, sectorId, "1", quarterId)
    const femaleIndex = this.getIndex(regionId, sectorId, "2", quarterId)

    const maleValue = this.processedData.employmentData[maleIndex] || 0
    const femaleValue = this.processedData.employmentData[femaleIndex] || 0

    const total = maleValue + femaleValue

    return {
      male: maleValue,
      female: femaleValue,
      malePercentage: total > 0 ? (maleValue / total * 100).toFixed(1) : '0.0',
      femalePercentage: total > 0 ? (femaleValue / total * 100).toFixed(1) : '0.0',
      total
    }
  }

  getGenderTrend() {
    return this.processedData.quarters.map(quarter => {
      const distribution = this.getGenderDistribution("0", "TOT", quarter.id)
      return {
        quarter: quarter.label,
        male: distribution.male,
        female: distribution.female,
        malePercentage: distribution.malePercentage,
        femalePercentage: distribution.femalePercentage
      }
    })
  }

  getSectorComparison(regionId) {
    const latestQuarter = this.processedData.quarters[this.processedData.quarters.length - 1]
    return this.processedData.sectors
        .filter(sector => sector.id !== 'TOT')
        .map(sector => {
          const distribution = this.getGenderDistribution(regionId, sector.id, latestQuarter.id)
          return {
            sector: sector.label,
            malePercentage: distribution.malePercentage,
            femalePercentage: distribution.femalePercentage,
            total: distribution.total
          }
        })
  }

  getLatestQuarter() {
    return this.processedData.quarters[this.processedData.quarters.length - 1].id
  }

  testDataPoint() {
    const distribution = this.getGenderDistribution("0", "3", "2024Q2")
    console.log("Test Data Point (Schweiz, Sektor 3, 2024Q2):")
    console.log(`Männer: ${distribution.male} (${distribution.malePercentage}%)`)
    console.log(`Frauen: ${distribution.female} (${distribution.femalePercentage}%)`)
    console.log(`Total: ${distribution.total}`)
  }
}

const dataProcessor = new DataProcessor()
dataProcessor.testDataPoint()
export default dataProcessor